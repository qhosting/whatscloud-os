import Queue from 'bull';
import puppeteer from 'puppeteer';
import { Lead, Organization } from '../models/index.js';
import { exportLeadToIntegrations } from '../services/webhookService.js';
import { scoreLead } from '../services/aiService.js';
import logger from '../config/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// 1. Definir Cola
export const scraperQueue = new Queue('scraper-queue', REDIS_URL);

// 2. Procesador (Worker Logic) - PROFESSIONAL SCRAPER
scraperQueue.process(2, async (job) => {
    const { niche, city, country, limit, userId, organizationId } = job.data;

    logger.info(`[QUEUE] Starting Real Scraper Job ${job.id}: ${niche} in ${city}`);

    let browser;
    try {
        const launchArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1280,720'
        ];

        browser = await puppeteer.launch({
            args: launchArgs,
            headless: "new" // Using the more stable 'new' headless mode
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

        const query = `${niche} en ${city}, ${country || ''}`;
        const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

        job.progress(5);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
        job.progress(10);

        // --- STEP 1: SCROLL TO LOAD ENOUGH RESULTS ---
        logger.info(`[SCRAPER] Scrolling to find at least ${limit} results...`);
        let resultsFound = 0;
        let scrollAttempts = 0;
        const maxScrollAttempts = 15;

        while (resultsFound < limit && scrollAttempts < maxScrollAttempts) {
            resultsFound = (await page.$$('a[href*="/maps/place/"]')).length;
            await page.evaluate(() => {
                const feed = document.querySelector('div[role="feed"]');
                if (feed) feed.scrollBy(0, 1500);
            });
            await new Promise(r => setTimeout(r, 2000));
            scrollAttempts++;
            job.progress(Math.min(10 + (scrollAttempts * 2), 40));
        }

        const itemLinks = await page.$$('a[href*="/maps/place/"]');
        logger.info(`[SCRAPER] Found ${itemLinks.length} items. Starting extraction...`);
        
        const scrapedLeads = [];
        const maxToScrape = Math.min(itemLinks.length, limit);

        // --- STEP 2: ITERATE AND EXTRACT ---
        for (let i = 0; i < maxToScrape; i++) {
            try {
                // Re-fetch links to avoid stale handle
                const freshLinks = await page.$$('a[href*="/maps/place/"]');
                if (!freshLinks[i]) continue;

                await freshLinks[i].click();
                await new Promise(r => setTimeout(r, 2000)); // Wait for panel to open
                
                // Detailed Extraction Logic
                const data = await page.evaluate(() => {
                    const getT = (s) => document.querySelector(s)?.innerText?.trim() || '';
                    const name = getT('h1');
                    
                    const ratingStr = document.querySelector('span[role="img"]')?.getAttribute('aria-label') || '';
                    let rating = 0;
                    let reviews = 0;
                    
                    if (ratingStr) {
                        const rMatch = ratingStr.match(/([\d.]+)\s*estrellas/);
                        if (rMatch) rating = parseFloat(rMatch[1]);
                        const revMatch = ratingStr.match(/([\d,]+)\s*reseñas/);
                        if (revMatch) reviews = parseInt(revMatch[1].replace(/,/g, ''));
                    }

                    const findBtnData = (prefix) => {
                        const btn = Array.from(document.querySelectorAll('button[data-item-id]'))
                                         .find(b => b.getAttribute('data-item-id')?.startsWith(prefix));
                        return btn?.innerText?.trim() || '';
                    };

                    const address = findBtnData('address');
                    const website = findBtnData('authority');
                    const phone = findBtnData('phone');

                    return { name, rating, reviews, phone, address, website };
                });

                if (data.name && data.phone) {
                    let socialLinks = {};

                    // --- SOCIAL RECON (Visit Website if exists) ---
                    if (data.website && data.website.includes('.')) {
                        try {
                            const webPage = await browser.newPage();
                            await webPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
                            
                            const targetUrl = data.website.startsWith('http') ? data.website : `http://${data.website}`;
                            logger.info(`[SOCIAL-RECON] Visiting ${targetUrl}`);
                            
                            await webPage.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 15000 });
                            
                            socialLinks = await webPage.evaluate(() => {
                                const links = Array.from(document.querySelectorAll('a[href]')).map(a => a.href.toLowerCase());
                                return {
                                    facebook: links.find(l => l.includes('facebook.com/')) || null,
                                    instagram: links.find(l => l.includes('instagram.com/')) || null,
                                    linkedin: links.find(l => l.includes('linkedin.com/')) || null,
                                    twitter: links.find(l => l.includes('twitter.com/') || l.includes('x.com/')) || null
                                };
                            });
                            await webPage.close();
                        } catch (webErr) {
                            logger.warn(`[SOCIAL-RECON] Failed for ${data.website}: ${webErr.message}`);
                        }
                    }

                    const [lead, created] = await Lead.upsert({
                        name: data.name,
                        phone: data.phone,
                        niche,
                        city,
                        country,
                        website: data.website,
                        address: data.address,
                        rating: data.rating,
                        reviews: data.reviews,
                        organizationId: organizationId,
                        metadata: { 
                            source: 'Google Maps Real Scraper', 
                            scrapedAt: new Date(),
                            socials: socialLinks 
                        }
                    });

                    scrapedLeads.push(lead);
                    
                    // 1. Scoring with AI
                    try {
                        const scoreData = await scoreLead(lead);
                        if (scoreData?.score) {
                            await lead.update({ aiScore: scoreData.score, aiSummary: scoreData.summary });
                        }
                    } catch (e) { logger.warn(`[SCRAPER] AI Score warning: ${e.message}`); }
                }

                const extractionProgress = 40 + Math.floor(((i + 1) / maxToScrape) * 60);
                job.progress(extractionProgress);

            } catch (err) {
                logger.error(`[SCRAPER] Error extracting item ${i}: ${err.message}`);
            }
        }

        await browser.close();
        logger.info(`[QUEUE] Job ${job.id} completed. Extracted ${scrapedLeads.length} leads.`);
        return scrapedLeads;

    } catch (error) {
        if (browser) await browser.close();
        logger.error(`[QUEUE] Real Scraper Job ${job.id} Failed: ${error.message}`);
        throw error;
    }
});
