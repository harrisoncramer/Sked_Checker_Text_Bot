require('dotenv').config({ path: "../envs/sked_checker.env" });

const cron = require("node-cron");
const moment = require("moment");
const logger = require("./logger");

// Import utility functions...
const { launchBots, setUpPuppeteer } = require("./setup"); 

// Import bots...
const skedChecker = require("./bots/skedChecker");

// Import business logic...
const { 
    sfrcBusiness, 
    sfrcWitnesses, 
    sascBusiness, 
    sascWitnesses, 
    hfacBusiness, 
    hfacWitnesses, 
    hascBusiness, 
    hascWitnesses,
    svacBusiness,
    svacWitnesses,
    hvacBusiness,
    hvacWitnesses,
    hvacMarkup
 } = require("./bots/guts/skedChecker");

// Import schemas...
const { 
    SASCSchema, 
    SFRCSchema, 
    HASCSchema, 
    HFACSchema,
    SVACSchema,
    HVACSchema
 } = require("./mongodb/schemas");

// Run program...
if(process.env.NODE_ENV === 'production'){
    logger.info(`Starting up bots in ${process.env.NODE_ENV} at ${moment().format("llll")}`);
    cron.schedule('*/15 * * * *', async () => {
        try {
            let { today, browser, page } = await setUpPuppeteer();
            logger.info(`Running program at ${today.format("llll")}`);

            await launchBots({ page, browser, bots: [
                { bot: skedChecker, args: { link: 'https://www.foreign.senate.gov/hearings', business: sfrcBusiness, getWitnesses: sfrcWitnesses, type: 'SFRC', comparer: 'title', params: ['location', 'date'], schema: SFRCSchema }},
                { bot: skedChecker, args: { link: 'https://www.armed-services.senate.gov/hearings', business: sascBusiness, getWitnesses: sascWitnesses, type: 'SASC', comparer: 'title', schema: SASCSchema, params: ['location', 'date'] }},
                { bot: skedChecker, args: { link: 'https://foreignaffairs.house.gov/hearings', business: hfacBusiness, getWitnesses: hfacWitnesses, type: 'HFAC', comparer: 'recordListTitle', schema: HFACSchema, params: ['recordListTime', 'recordListDate'] }},
                { bot: skedChecker, args: { link: 'https://armedservices.house.gov/hearings', business: hascBusiness, getWitnesses: hascWitnesses, type: 'HFAC', comparer: 'recordListTitle', schema: HASCSchema, params: ['recordListTime', 'recordListDate'] }},
                { bot: skedChecker, args: { link: 'https://www.veterans.senate.gov/hearings', business: svacBusiness, getWitnesses: svacWitnesses, type: 'SVAC', comparer: 'title', schema: SVACSchema, params: ['location', 'date'] }},
                { bot: skedChecker, args: { link: 'https://veterans.house.gov/events/hearings', extra: { link: 'https://veterans.house.gov/events/markups', business: hvacMarkup }, business: hvacBusiness, getWitnesses: hvacWitnesses, type: 'HVAC', comparer: 'title', schema: HVACSchema, params: ['location', 'date'] }}
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

        //    await skedChecker({ page, bot: skedChecker, args: { link: 'https://foreignaffairs.house.gov/hearings', business: hfacBusiness, getWitnesses: hfacWitnesses, type: 'HFAC', comparer: 'recordListTitle', params: ['recordListTime', 'recordListDate'], schema: HFACSchema }});
        //    await skedChecker({ page, bot: skedChecker, args: { link: 'https://armedservices.house.gov/hearings', business: hascBusiness, getWitnesses: hascWitnesses, type: 'HASC', comparer: 'recordListTitle', params: ['recordListTime', 'recordListDate'], schema: HASCSchema }});
        //    await skedChecker({ page, bot: skedChecker, args: { link: 'https://www.armed-services.senate.gov/hearings', business: sascBusiness, getWitnesses: sascWitnesses, type: 'SASC', comparer: 'title', params: ['location', 'date'], schema: SASCSchema }});
        //    await skedChecker({ page, bot: skedChecker, args: { link: 'https://www.foreign.senate.gov/hearings', business: sfrcBusiness, getWitnesses: sfrcBusiness, type: 'SFRC', comparer: 'title', params: ['location', 'date'], schema: SFRCSchema }});
        //    await skedChecker({ page, bot: skedChecker, args: { link: 'https://www.veterans.senate.gov/hearings', business: svacBusiness, getWitnesses: svacWitnesses, type: 'SVAC', comparer: 'title', schema: SVACSchema, params: ['location', 'date'] }});
           await skedChecker({ page, bot: skedChecker, args: { link: 'https://veterans.house.gov/events/hearings', extra: { link: 'https://veterans.house.gov/events/markups', business: hvacMarkup }, business: hvacBusiness, getWitnesses: hvacWitnesses, type: 'HVAC', comparer: 'title', schema: HVACSchema, params: ['location', 'date'] }});

            await page.close();
            await browser.close();
            logger.info(`Chrome Closed Bots.`);
        } catch (err){
            logger.error('Root Error in development. ', err);
        }
    })();
};