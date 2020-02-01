const pupeteer = require('puppeteer');
const {asyncForEach} = require('../util');
const { clean } = require("../bots/guts");
const logger = require("../logger");

module.exports = {
  setUpPuppeteer: async () => {
    const isHeadless = process.env.NODE_ENV === "production";
    const browser = await pupeteer.launch({
      headless: isHeadless,
      devtools: isHeadless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu','--window-size=1920x1080'],
    });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage(); // Create new instance of puppet

    page.on('error', err => {
      logger.error('Puppeteer error. ', err);
    });

    page.setDefaultNavigationTimeout(20000);

    if (process.env.NODE_ENV === 'production') {
      await page.setRequestInterception(true); // Optimize (no stylesheets, images)...
      page.on('request', request => {
        if (['image', 'stylesheet'].includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });
    }
    return {browser: context, page};
  },
  setupFunctions: async page => {
    await page.addScriptTag({ path: "./setup/functions/index.js" });
    await page.addScriptTag({ url: "https://code.jquery.com/jquery-3.4.1.slim.min.js" }); // Add jQuery...
  },
  launchBots: async ({ page, browser, bot, instances, db }) => {
    await asyncForEach(instances, async args => {
      try {
        await bot({ page, browser, db, args });
      } catch (err) {
        let deadPages = await browser.pages();
        await Promise.all(deadPages.filter((x,i) => i !== 0).map(page => page.close()));
        logger.error(`${args.schema.collection.collectionName}: There was a problem with the bot: `, err.stack);
      }
    });
  },
};
