import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'WhatsCloud Scrapper API', mode: 'production' });
});

app.post('/api/scrape', async (req, res) => {
  const { niche, city, country, limit = 5 } = req.body;
  console.log(`[SCRAPER] Request received: ${niche} in ${city}, ${country}`);

  if (!niche || !city) {
    return res.status(400).json({ error: 'Missing niche or city' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
      headless: true
    });

    const page = await browser.newPage();

    // Set user agent to avoid immediate blocking
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const query = `${niche} en ${city}, ${country || ''}`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

    console.log(`[SCRAPER] Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for the feed (sidebar results)
    try {
        await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
    } catch (e) {
        console.log("Feed not found, maybe no results or different layout.");
        throw new Error("Google Maps did not load results list.");
    }

    const leads = [];

    // Scroll a bit to ensure items are rendered
    await page.evaluate(async () => {
        const feed = document.querySelector('div[role="feed"]');
        if(feed) {
            feed.scrollBy(0, 1000);
            await new Promise(r => setTimeout(r, 1000));
        }
    });

    // Get list items (cards)
    // The selector for items usually involves role="article" or specific classes,
    // but generic 'a' tags inside the feed are often the clickable items.
    const itemSelectors = await page.$$('div[role="feed"] > div > div > a');

    console.log(`[SCRAPER] Found ${itemSelectors.length} potential items. Processing top ${limit}...`);

    for (let i = 0; i < Math.min(itemSelectors.length, limit); i++) {
        try {
            // Re-select elements to avoid detached DOM errors
            const freshItems = await page.$$('div[role="feed"] > div > div > a');
            if (!freshItems[i]) continue;

            // Click the item to load details
            await freshItems[i].click();

            // Wait for details to load (look for h1 with business name)
            await page.waitForSelector('h1', { timeout: 5000 });
            await new Promise(r => setTimeout(r, 1000)); // Stability pause

            // Extract Data
            const data = await page.evaluate(() => {
                const getText = (selector) => document.querySelector(selector)?.innerText || '';
                const getAttribute = (selector, attr) => document.querySelector(selector)?.getAttribute(attr) || '';

                // Name
                const businessName = getText('h1');

                // Rating & Reviews
                // Usually in a span like "4.5 (100)"
                // We look for aria-label containing "stars" or similar structure
                let rating = 0;
                let reviews = 0;

                // Try finding the rating span
                const ratingElement = document.querySelector('div[role="main"] span[aria-hidden="true"]');
                // This is risky, let's try searching by text content structure if possible or specific classes
                // Google classes are random like .F7nice

                // Fallback: Loop buttons to find "Reviews"
                const buttons = Array.from(document.querySelectorAll('button'));
                const addressBtn = buttons.find(b => b.getAttribute('data-item-id')?.includes('address'));
                const phoneBtn = buttons.find(b => b.getAttribute('data-item-id')?.includes('phone'));
                const websiteBtn = buttons.find(b => b.getAttribute('data-item-id')?.includes('authority'));

                const address = addressBtn ? addressBtn.innerText : '';
                const phone = phoneBtn ? phoneBtn.innerText : '';
                const website = websiteBtn ? websiteBtn.href : '';

                // Extracting text roughly for rating
                const mainText = document.querySelector('div[role="main"]')?.innerText || '';
                const ratingMatch = mainText.match(/(\d\.\d)\s*\(([\d,]+)\)/); // e.g. 4.5 (1,200)
                if (ratingMatch) {
                    rating = parseFloat(ratingMatch[1]);
                    reviews = parseInt(ratingMatch[2].replace(/,/g, ''));
                }

                return {
                    businessName,
                    address,
                    phone,
                    website,
                    rating,
                    reviews
                };
            });

            if (data.businessName) {
                leads.push({
                    id: `scraped_${Date.now()}_${i}`,
                    ...data,
                    category: 'Scraped Lead',
                    status: 'new',
                    mapsUrl: page.url()
                });
            }

            // Go back to list if needed, or just click next from the list (the list is on the side, always visible in desktop mode)
            // In some layouts, the list remains on the left.

        } catch (err) {
            console.error(`[SCRAPER] Error processing item ${i}:`, err.message);
        }
    }

    console.log(`[SCRAPER] Extraction complete. Found ${leads.length} leads.`);
    await browser.close();

    res.json(leads);

  } catch (error) {
    console.error('[SCRAPER] Critical Error:', error);
    if (browser) await browser.close();
    res.status(500).json({ error: 'Internal Server Error during scraping', details: error.message });
  }
});

// Serve Static Files (Vite Build)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Handle SPA Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
