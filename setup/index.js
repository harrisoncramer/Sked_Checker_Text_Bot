const pupeteer = require('puppeteer');
const {asyncForEach} = require('../util');
const { clean } = require("../bots/guts");
const logger = require("../logger");

module.exports = {
  setUpPuppeteer: async () => {
    const headless = process.env.NODE_ENV === "production";
    const browser = await pupeteer.launch({
      headless: true,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu','--window-size=1920x1080'],
    });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage(); // Create new instance of puppet

    page.on('error', err => {
      logger.error('Puppeteer error.', err);
    });

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
    await page.addScriptTag({ path: "./setup/helperFunctions.js" });
    await page.addScriptTag({ url: "https://code.jquery.com/jquery-3.4.1.slim.min.js" }); // Add jQuery...
  },
  launchBots: async ({page, browser, today, bots}) => {
    let catcher = (err, bot) =>
      process.env.NODE_ENV === 'production'
        ? logger.error(bot, err)
        : logger.info(bot, err);

    await asyncForEach(bots, async x => {
      try {
        await x.bot({page, browser, today, args: x.args});
      } catch (err) {
        catcher(err);
      }
    });
  },
};
