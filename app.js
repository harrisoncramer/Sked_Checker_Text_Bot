require('dotenv').config({ path: "../envs/sked_checker.env" });

const cron = require("node-cron");
const moment = require("moment");
const logger = require("./logger");

// Import utility functions...
const { launchBots, setUpPuppeteer } = require("./setup"); 

// Import bots...
const skedChecker = require("./bots/skedChecker");

// Import business
const { hfacBusiness, hfacWitnesses } = require("./bots/util/skedCheckerBusiness");

// Import schemas...
const schemas = require("./mongodb/schemas");

// Run program...
if(process.env.NODE_ENV === 'production'){
    logger.info(`Starting up bots in ${process.env.NODE_ENV} at ${moment().format("llll")}`);
    cron.schedule('*/15 * * * *', async () => {
        try {
            let { today, browser, page } = await setUpPuppeteer();
            logger.info(`Running program at ${today.format("llll")}`);

            await launchBots({ page, browser, today, bots: [
                // { bot: skedChecker, args: {  }},
                // { bot: skedChecker, args: {  }},
                // { bot: skedChecker, args: {  }},
                { bot: skedChecker, args: { link: 'https://foreignaffairs.house.gov/hearings', business: hfacBusiness, getWitnesses: hfacWitnesses, type: 'HFAC', comparer: 'recordListTitle', schema: schemas.HFACSchema, params: ['recordListTime', 'recordListDate'] }},
            ]});

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

            await skedChecker({ page, today, bot: skedChecker, args: { link: 'https://foreignaffairs.house.gov/hearings', business: hfacBusiness, getWitnesses: hfacWitnesses, type: 'HFAC', comparer: 'recordListTitle', params: ['recordListTime', 'recordListDate'], schema: schemas.HFACSchema }});

            await page.close();
            await browser.close();
            logger.info(`Chrome Closed Bots.`);
        } catch (err){
            logger.error('Root Error in development. ', err);
        }
    })();
};