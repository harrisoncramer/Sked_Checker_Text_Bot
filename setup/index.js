const winston  = require('winston');
const fs = require('fs');
const path = require('path');
const logDir = 'log';
const moment = require("moment");
const pupeteer = require("puppeteer");
const { asyncForEach } = require("../util");

module.exports = {
    setUpPuppeteer: async () => {
        const today = moment();
        const headless = process.env.NODE_ENV === "production";
        const browser = await pupeteer.launch({headless, devtools: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--incognito']});
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage(); // Create new instance of puppet
        
        page.on('error', (err) => {
            logger.error('Puppeteer error.', err);
        });
        
        if(process.env.NODE_ENV === "production"){
            await page.setRequestInterception(true) // Optimize (no stylesheets, images)...
            page.on('request', (request) => {
                if(['image', 'stylesheet'].includes(request.resourceType())){
                    request.abort();
                } else {
                    request.continue();
                }
            });
        };

        return { today, browser, page };
    },

    launchBots: async({ page, browser, today, bots }) => {
    
        let catcher = (err, bot) => process.env.NODE_ENV === 'production' ? logger.error(bot, err) : logger.info(bot, err);
    
        await asyncForEach(bots, async(x) => {
             try {
                await x.bot({ page, browser, today, args: x.args });
             } catch(err){
                 catcher(err);
             }
        });
    
    }
};