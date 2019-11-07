require('dotenv').config();

const cron = require("node-cron");
const moment = require("moment");
const logger = require("./logger");

// Import utility functions...
const { launchBots, setUpPuppeteer } = require("./setup"); 

// Import bots...
const HFAC = require("./bots/HFAC"); 
const HASC = require("./bots/HASC"); 
const SASC = require("./bots/SASC"); 
const SFRC = require("./bots/SFRC"); 
const SVAC = require("./bots/SVAC"); 
const HVAC = require("./bots/HVAC"); 

// Run program...
if(process.env.NODE_ENV === 'production'){
    logger.info(`Starting up bots in ${process.env.NODE_ENV} at ${moment().format("llll")}`);
    cron.schedule('*/15 * * * *', async () => {
        try {
            let { today, browser, page } = await setUpPuppeteer();
            logger.info(`Running program at ${today.format("llll")}`);

            await launchBots({ page, browser, today, bots: [HFAC, HASC, HVAC, SASC, SFRC, SVAC] }); // Launch bots in production...

            await page.close();
            await browser.close();
            logger.info(`Chrome Closed Bots.`);
        } catch (err){
            logger.error('Root Error.', err);
        }                
    });
} else {
    (async () => {
        try {
            let { today, browser, page } = await setUpPuppeteer();
            logger.info(`Running program at ${today.format("llll")}`);

            // await HFAC({ today, browser, page });
            // await HASC({ today, browser, page });
            // await SASC({ today, browser, page });
            // await SVAC({ today, browser, page });
            await HVAC({ today, browser, page });
            // await SFRC({ today, browser, page });

            await page.close();
            await browser.close();
            logger.info(`Chrome Closed Bots.`);
        } catch (err){
            logger.error('Root Error in development. ', err);
        }
    })();
};