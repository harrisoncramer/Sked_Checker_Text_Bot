const puppeteer = require('puppeteer-extra');
const randomUser = require('random-useragent');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const getProxy = require('./proxies');

const {asyncForEach, getRandom} = require('../util');
const logger = require('../logger')(module);

module.exports = {
  setupPuppeteer: async ({type}) => {
    // Set initial variables
    const isProduction = process.env.NODE_ENV === 'production';
    let proxy = null;
    const args = ['--no-sandbox'];

    // Determine tor/proxy for browser
    if (type === 'tor') {
      let ports = process.env.TOR_PORTS.split(' ');
      let portIndex = getRandom(0, ports.length - 1)();
      let port = isProduction ? ports[portIndex] : '9050';
      proxy = `socks5://127.0.0.1:` + port;
    }
    if (type === 'proxy') {
      let proxyData = await getProxy();
      proxy = `http://${proxyData.ip}:${proxyData.port}`;
    }
    if (proxy) {
      args.push(`--proxy-server=${proxy}`);
    }

    /// Initialize Browser
    const browser = await puppeteer.launch({
      headless: isProduction,
      devtools: !isProduction,
      args,
    });
    browser.on('disconnected', () => {
      logger.info('Browser was disconnected.');
    });

    ///// Page setup
    const page = (await browser.pages())[0];
    page.on('error', err => {
      logger.error('Page error. ', err);
    });
    let userAgentString = randomUser.getRandom();
    await page.setUserAgent(userAgentString);
    page.setDefaultNavigationTimeout(0); // May be required to lengthen this in order to get more reliable data...

    //// Confirm page is working
    await page.goto('https://check.torproject.org/');
    const isUsingTor = await page.$eval('body', el =>
      el.innerHTML.includes(
        'Congratulations. This browser is configured to use Tor',
      ),
    );
    if (!isUsingTor && type === 'tor') {
      logger.error(`Browser is not using Tor. Exiting...`);
      return await browser.close();
    }

    return {browser, page};
  },
  setPageBlockers: async page => {
    await page.setRequestInterception(true);
    const blockedResources = [
      'quantserve',
      'adzerk',
      'doubleclick',
      'adition',
      'exelator',
      'sharethrough',
      'twitter',
      'google-analytics',
      'fontawesome',
      'facebook',
      'analytics',
      'optimizely',
      'clicktale',
      'mixpanel',
      'zedo',
      'clicksor',
      'tiqcdn',
      'googlesyndication',
      'youtube',
    ];

    page.on('request', async request => {
      const url = request.url().toLowerCase();
      // const headers = request.headers();
      if (
        url.endsWith('.mp4') ||
        url.endsWith('.avi') ||
        url.endsWith('.flv') ||
        url.endsWith('.mov') ||
        url.endsWith('.wmv') ||
        ['image', 'stylesheet', 'media', 'jpg', 'png'].includes(
          request.resourceType(),
        ) ||
        blockedResources.some(resource => url.indexOf(resource) !== -1)
      ) {
        try {
          await request.abort();
        } catch (err) {
          if (err.message !== 'Request is already handled!') {
            logger.info(`Problem blocking resource from ${url}`);
          }
        }
      } else {
        try {
          await request.continue();
        } catch (err) {
          if (err.message !== 'Request is already handled!') {
            logger.info(`Problem blocking resource from ${url}`);
          }
        }
      }
    });
  },
  setPageScripts: async page => {
    await page.addScriptTag({path: './setup/functions/index.js'});
    await page.addScriptTag({path: './setup/jquery/jquery-3.4.1.slim.min.js'}); /// "https://code.jquery.com/jquery-3.4.1.slim.min.js" }); // Add jQuery...
  },
  launchPuppeteerBots: async ({page, browser, bot, instances, db}) => {
    await asyncForEach(instances, async args => {
      try {
        await bot({page, browser, db, args});
      } catch (err) {
        let deadPages = await browser.pages();
        await Promise.all(
          deadPages.filter((x, i) => i !== 0).map(page => page.close()),
        );
        logger.error(
          `${
            args.schema.collection.collectionName
          } > There was a problem with the bot: `,
          err,
        );
      }
    });
  },
  launchAxiosBots: async ({db, proxyData, bot, instances}) => {
    await asyncForEach(instances, async args => {
      try {
        await bot({db, proxyData, args});
      } catch (err) {
        logger.error(
          `${
            args.schema.collection.collectionName
          } > There was a problem with the bot: `,
          err,
        );
      }
    });
  },
};
