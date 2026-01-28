import Queue from 'bull';
import puppeteer from 'puppeteer';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// 1. Definir Cola
export const scraperQueue = new Queue('scraper-queue', REDIS_URL);

// 2. Procesador (Worker Logic)
// Concurrency: 2 (Solo 2 navegadores a la vez para proteger RAM)
scraperQueue.process(2, async (job) => {
    const { niche, city, country, limit } = job.data;

    console.log(`[QUEUE] Processing Job ${job.id}: ${niche} in ${city}`);

    let browser;
    try {
        const launchArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ];

        // PROXY INTEGRATION (Phase 3)
        if (process.env.PROXY_SERVER) {
            launchArgs.push(`--proxy-server=${process.env.PROXY_SERVER}`);
        }

        browser = await puppeteer.launch({
            args: launchArgs,
            headless: true
        });

        const page = await browser.newPage();

        // PROXY AUTH
        if (process.env.PROXY_USERNAME && process.env.PROXY_PASSWORD) {
            await page.authenticate({
                username: process.env.PROXY_USERNAME,
                password: process.env.PROXY_PASSWORD
            });
        }

        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const query = `${niche} en ${city}, ${country || ''}`;
        const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

        job.progress(10); // 10% - Browser Started

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        job.progress(30); // 30% - Page Loaded

        try {
            await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
        } catch (e) {
            throw new Error("Google Maps did not load results list.");
        }

        const leads = [];

        await page.evaluate(async () => {
            const feed = document.querySelector('div[role="feed"]');
            if(feed) {
                feed.scrollBy(0, 1000);
                await new Promise(r => setTimeout(r, 1000));
            }
        });

        const itemSelectors = await page.$$('div[role="feed"] > div > div > a');

        job.progress(50); // 50% - Items Found

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
                    const addressBtn = buttons.find(b => b.getAttribute('data-item-id')?.includes('address'));
                    const address = addressBtn ? addressBtn.innerText : '';

                    return { businessName, rating, reviews, phone, address };
                });

                if (data.businessName) {
                    leads.push({
                        id: `scraped_${Date.now()}_${i}`,
                        ...data,
                        category: niche,
                        status: 'new',
                        mapsUrl: page.url()
                    });
                }

                // Update Progress loop
                const progress = 50 + Math.floor(((i + 1) / limit) * 50);
                job.progress(progress);

            } catch (err) {
                console.error(`[SCRAPER] Item error: ${err.message}`);
            }
        }

        await browser.close();
        return leads; // Job Result

    } catch (error) {
        if (browser) await browser.close();
        throw error;
    }
});
