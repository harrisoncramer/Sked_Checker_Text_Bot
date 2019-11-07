const { HVACSchema } = require("../mongodb/schemas");
const { asyncForEach } = require("../util");

const getData = require("../mongodb/getData");
const uploadNewData = require("../mongodb/uploadNewData");
const getChangedData = require("../mongodb/getChangedData");
const modifyData = require("../mongodb/modifyData");

const sortPageData = require("./util/sortPageData");

const sendText = require("../texter");
const mongoose = require("mongoose");
const logger = require("../logger");

module.exports = async ({ page, browser, today }) => {
    logger.info(`Checking HVAC at ${today.format("llll")}`);

    try {
        var db = await mongoose.connect('mongodb://localhost:27017/resources', { useNewUrlParser: true, useUnifiedTopology: true });
        logger.info("Database connected.");
    } catch(err){
        return logger.error(`Could not connect to database. `, err);
    };

    try {
        await page.goto("https://veterans.house.gov/events/hearings", { waitUntil: 'networkidle2' }); // Ensure no network requests are happening (in last 500ms).
        logger.info("Navigated to hearings page.");
    } catch (err) {
        return logger.error(`Could not navigate to hearings page. `, err);
    };

    try {
        var pageData = await page.evaluate(() => {
            let trs = Array.from(document.querySelectorAll("tr.vevent")).map(x => x.querySelectorAll("td > div.faux-col"));
            let res = trs.reduce((agg, item, i) => {
                let title = item[0].textContent.replace(/\s\s+/g, ' ').trim();
                let link = item[0].querySelector("a").href;
                let location = item[2].textContent.trim();
                let date = item[3].textContent.trim();
                agg[i] = { link, title, location, date };
                return agg;
            }, Array(trs.length).fill().map(_ => ({})));

            return res;
        });
        logger.info("Page data defined.");  
        
    } catch(err){
        return logger.error(`Error parsing hearings page data. `, err);
    }

    try {
        await asyncForEach(pageData, async (datum) => {

            await page.goto(datum.link, { waitUntil: 'networkidle2' });
            let witnesses = await page.evaluate(() => {
                return Array.from(document.querySelectorAll("section.hearing__agenda b"))
                    .map((i => i.textContent.replace(/\s\s+/g, ' ').trim()))
                    .filter(x => !["Witnesses:", "", "Panel 1", "Panel 2", "Panel One", "Panel Two"].includes(x));
            });
            
            datum.witnesses = witnesses;
        });
    } catch(err){
        return logger.error(`Error fetching HVAC hearings witnesses. `, err);
    }

    try {
        await page.goto("https://veterans.house.gov/events/markups", { waitUntil: 'networkidle2' }); // Ensure no network requests are happening (in last 500ms).
        logger.info("Navigated to markups page.");
    } catch (err) {
        return logger.error(`Could not navigate to markups page. `, err);
    };

    try {
        var pageDataTwo = await page.evaluate(() => {
            let trs = Array.from(document.querySelectorAll("tr.vevent")).map(x => x.querySelectorAll("td > div.faux-col"));
            let res = trs.reduce((agg, item, i) => {
                let title = item[0].textContent.replace(/\s\s+/g, ' ').trim();
                let link = item[0].querySelector("a").href;
                let location = item[1].textContent.trim();
                let date = item[2].textContent.trim().concat(` at ${item[3].textContent.trim()}`);
                agg[i] = { link, title, location, date };
                return agg;
            }, Array(trs.length).fill().map(_ => ({})));

            return res;
        });
        logger.info("Markups page data defined.");  
        
    } catch(err){
        return logger.error(`Error parsing markups page data. `, err);
    }

    pageData = pageData.concat(pageDataTwo);

    try {
        var dbData = await getData(HVACSchema);
        var { newData, existingData } = await sortPageData({ pageData, dbData, comparer: 'title' });
        var { dataToChange, dataToText } = await getChangedData({ existingData, model: HVACSchema, comparer: 'title', params: ['location', 'date']}, 'witnesses');    
        logger.info(`**** New records: ${newData.length} || Records to change: ${dataToChange.length} ****`);
    } catch(err) {
        logger.error(`Error processing markup data. `, err);
    };

    try {
        if(newData.length > 0 ){
            await uploadNewData(newData, HVACSchema);
            logger.info(`${newData.length} records uploaded successfully.`)
        };
        if(dataToChange.length > 0){
            await modifyData({ dataToChange, model: HVACSchema });
            logger.info(`${dataToChange.length} records modified successfully.`)
        };
    } catch (err) {
        logger.error(`Error uploading data. `, err);
    }

    try {
        if(newData.length > 0 ){
            let myMessage = await sendText({ title: 'New HVAC Meeting(s)', data: newData});
            logger.info(`${myMessage ? 'Message sent: '.concat(JSON.stringify(myMessage)) : 'Message not sent, running in development.'}`);
        };
        if(dataToChange.length > 0){
            let myMessage = await sendText({ title: 'Updated HVAC Meeting(s)', data: dataToText});
            logger.info(`${myMessage ? 'Message sent: '.concat(JSON.stringify(myMessage)) : 'Message not sent, running in development.'}`);
        };
    } catch(err){
        logger.error(`Error texting data. `, err);
    };
        
    try {
        await db.disconnect();
        logger.info("HVAC Done.");
    } catch (err) {
        logger.info("Error disconnecting: ", err);
    }

};