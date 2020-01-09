const winston = require('winston');
const fs = require('fs');
const path = require('path');
const logDir = 'log';
const moment = require('moment');
const pupeteer = require('puppeteer');
const {asyncForEach} = require('../util');

module.exports = {
  setUpPuppeteer: async () => {
    // const headless = process.env.NODE_ENV === "production";
    const browser = await pupeteer.launch({
      headless: false,
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
        if (['image', 'stylesheet', 'script'].includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });
    }

    return {browser, page};
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
