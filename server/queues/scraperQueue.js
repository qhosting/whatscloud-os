import Queue from 'bull';
import puppeteer from 'puppeteer';
import { Lead, Organization } from '../models/index.js';
import { exportLeadToIntegrations } from '../services/webhookService.js';
import { scoreLead } from '../services/aiService.js';
import logger from '../config/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// 1. Definir Cola
export const scraperQueue = new Queue('scraper-queue', REDIS_URL);

// 2. Procesador (Worker Logic)
scraperQueue.process(2, async (job) => {
    const { niche, city, country, limit, userId, organizationId } = job.data;

    logger.info(`[QUEUE] Processing Job ${job.id}: ${niche} in ${city} for User ${userId}`);

    let browser;
    try {
        const launchArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ];

        if (process.env.PROXY_SERVER) {
            launchArgs.push(`--proxy-server=${process.env.PROXY_SERVER}`);
        }

        browser = await puppeteer.launch({
            args: launchArgs,
            headless: true
        });

        const page = await browser.newPage();

        if (process.env.PROXY_USERNAME && process.env.PROXY_PASSWORD) {
            await page.authenticate({
                username: process.env.PROXY_USERNAME,
                password: process.env.PROXY_PASSWORD
            });
        }

        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const query = `${niche} en ${city}, ${country || ''}`;
        const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

        job.progress(10);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        job.progress(30);

        try {
            await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
        } catch (e) {
            throw new Error("Google Maps did not load results list.");
        }

        const scrapedLeads = [];

        await page.evaluate(async () => {
            const feed = document.querySelector('div[role="feed"]');
            if (feed) {
                feed.scrollBy(0, 1000);
                await new Promise(r => setTimeout(r, 1000));
            }
        });

        const itemSelectors = await page.$$('div[role="feed"] > div > div > a');
        job.progress(50);

        for (let i = 0; i < Math.min(itemSelectors.length, limit); i++) {
            try {
                const freshItems = await page.$$('div[role="feed"] > div > div > a');
                if (!freshItems[i]) continue;

                await freshItems[i].click();
                await page.waitForSelector('h1', { timeout: 5000 });
                await new Promise(r => setTimeout(r, 500));

                const data = await page.evaluate(() => {
                    const getText = (selector) => document.querySelector(selector)?.innerText || '';
                    const businessName = getText('h1');

                    let rating = 0;
                    let reviews = 0;
                    const mainText = document.querySelector('div[role="main"]')?.innerText || '';
                    const ratingMatch = mainText.match(/(\d\.\d)\s*\(([\d,]+)\)/);
                    if (ratingMatch) {
                        rating = parseFloat(ratingMatch[1]);
                        reviews = parseInt(ratingMatch[2].replace(/,/g, ''));
                    }

                    const buttons = Array.from(document.querySelectorAll('button'));
                    const phoneBtn = buttons.find(b => b.getAttribute('data-item-id')?.includes('phone'));
                    const phone = phoneBtn ? phoneBtn.innerText : '';
                    const websiteBtn = buttons.find(b => b.getAttribute('data-item-id')?.includes('authority'));
                    const website = websiteBtn ? websiteBtn.innerText : '';
                    const addressBtn = buttons.find(b => b.getAttribute('data-item-id')?.includes('address'));
                    const address = addressBtn ? addressBtn.innerText : '';

                    return { businessName, rating, reviews, phone, address, website };
                });

                if (data.businessName && data.phone) {
                    const [lead, created] = await Lead.upsert({
                        name: data.businessName,
                        phone: data.phone,
                        niche,
                        city,
                        country,
                        website: data.website,
                        address: data.address,
                        rating: data.rating,
                        reviews: data.reviews,
                        organizationId: organizationId,
                        metadata: { mapsUrl: page.url() }
                    });

                    scrapedLeads.push(lead);
                    logger.info(`[SCRAPER] Lead ${created ? 'Created' : 'Updated'}: ${data.phone}`);

                    // 1. Scoring with AI
                    try {
                        const { score, summary } = await scoreLead(lead);
                        if (score !== null) {
                            await lead.update({ aiScore: score, aiSummary: summary });
                            logger.info(`[SCRAPER] Lead Scored (${score}/100): ${data.phone}`);
                        }
                    } catch (aiError) {
                        logger.error(`[SCRAPER] AI Scoring Error: ${aiError.message}`);
                    }

                    // 2. Trigger Core Integrations (n8n, Chatwoot, ACC)
                    try {
                        const org = await Organization.findByPk(organizationId);
                        if (org) {
                            await exportLeadToIntegrations(lead, org);
                        }
                    } catch (intError) {
                        logger.error(`[SCRAPER] Integration Trigger Error: ${intError.message}`);
                    }
                }

                const progress = 50 + Math.floor(((i + 1) / limit) * 50);
                job.progress(progress);

            } catch (err) {
                logger.error(`[SCRAPER] Item error: ${err.message}`);
            }
        }

        await browser.close();
        return scrapedLeads;

    } catch (error) {
        if (browser) await browser.close();
        logger.error(`[QUEUE] Job ${job.id} Failed: ${error.message}`);
        throw error;
    }
});
