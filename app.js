require('dotenv').config({ path: "../envs/sked_checker.env" });

const cron = require("node-cron");
const moment = require("moment");
const logger = require("./logger");

// Import utility functions...
const { launchBots, setUpPuppeteer } = require("./setup"); 

// Import bots...
const skedChecker = require("./bots/skedChecker");

// Import business...
const business = require("./bots/util/skedCheckerBusiness");

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
                { bot: skedChecker, args: { link: 'https://foreignaffairs.house.gov/hearings', business: business.hfacBusiness, getWitnesses: business.hfacWitnesses, type: 'HFAC', comparer: 'recordListTitle', schema: schemas.HFACSchema, params: ['recordListTime', 'recordListDate'] }},
                { bot: skedChecker, args: { link: 'https://armedservices.house.gov/hearings', business: business.hfacBusiness, getWitnesses: business.hfacWitnesses, type: 'HFAC', comparer: 'recordListTitle', schema: schemas.HASCSchema, params: ['recordListTime', 'recordListDate'] }},
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

           // await skedChecker({ page, today, bot: skedChecker, args: { link: 'https://foreignaffairs.house.gov/hearings', business: business.hfacBusiness, getWitnesses: business.hfacWitnesses, type: 'HFAC', comparer: 'recordListTitle', params: ['recordListTime', 'recordListDate'], schema: schemas.HFACSchema }});
           // await skedChecker({ page, today, bot: skedChecker, args: { link: 'https://armedservices.house.gov/hearings', business: business.hascBusiness, getWitnesses: business.hascWitnesses, type: 'HASC', comparer: 'recordListTitle', params: ['recordListTime', 'recordListDate'], schema: schemas.HASCSchema }});
           // await skedChecker({ page, today, bot: skedChecker, args: { link: 'https://www.armed-services.senate.gov/hearings', business: business.sascBusiness, getWitnesses: business.sascWitnesses, type: 'SASC', comparer: 'title', params: ['location', 'date'], schema: schemas.SASCSchema }});
            await skedChecker({ page, today, bot: skedChecker, args: { link: 'https://www.foreign.senate.gov/hearings', business: business.sfrcBusiness, getWitnesses: business.sfrcBusiness, type: 'SFRC', comparer: 'title', params: ['location', 'date'], schema: schemas.SFRCSchema }});

            await page.close();
            await browser.close();
            logger.info(`Chrome Closed Bots.`);
        } catch (err){
            logger.error('Root Error in development. ', err);
        }
    })();
};