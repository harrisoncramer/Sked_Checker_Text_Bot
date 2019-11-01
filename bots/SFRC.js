const getData = require("../mongodb/getData");
const { shallowSort } = require("../mongodb/sortPageData");
const uploadNewData = require("../mongodb/uploadNewData");
const getChangedData = require("../mongodb/getChangedData");
const modifyData = require("../mongodb/modifyData");
const sendText = require("../texter");
const { SFRCSchema } = require("../mongodb/schemas");
const mongoose = require("mongoose");
const logger = require("../logger");
const { asyncForEach } = require("../util");

module.exports = async ({ page, browser, today }) => {
    logger.info(`Checking SFRC at ${today.format("llll")}`);

    try {
        var db = await mongoose.connect('mongodb://localhost:27017/resources', { useNewUrlParser: true, useUnifiedTopology: true });
        logger.info("Database connected.");
    } catch(err){
        return logger.error(`Could not connect to database. `, err);
    };

    try {
        await page.goto("https://www.foreign.senate.gov/hearings", { waitUntil: 'networkidle2' }); // Ensure no network requests are happening (in last 500ms).
        logger.info("Navigated to page.");
    } catch (err) {
        return logger.error(`Could not navigate to page. `, err);
    };


    try {
        var pageData = await page.evaluate(() => {
            let divs = Array.from(document.querySelectorAll("div.table-holder > div.text-center"));
            let res = divs.reduce((agg, item, i) => {
                let link = item.children[0] ? item.children[0].href : 'No Link.';
                let title = item.querySelector("h2.title").textContent;
                let location = item.querySelector("span.location") ? item.querySelector("span.location").textContent.replace(/\s\s+/g, ' ').trim() : 'No location.';
                let date = item.querySelector("span.date") ? item.querySelector("span.date").textContent.replace(/\s\s+/g, ' ').trim() : 'No date.';
                agg[i] = { link, title, location, date };
                return agg;
            }, Array(divs.length).fill().map(_ => ({})));

            return res;
        });
        logger.info("Page data defined.");  
    } catch(err){
        return logger.error(`Error parsing page data. `, err);
    };

    try {
        await asyncForEach(pageData, async (datum) => {
            await page.goto(datum.link, { waitUntil: 'networkidle2' });
            let witnesses = await page.evaluate(() => {
                return Array.from(document.querySelectorAll("span.fn"))
                    .map((i => i.textContent.replace(/\s\s+/g, ' ').trim()));
            });
            
            datum.witnesses = witnesses;
            datum.title = datum.title.concat(`: ${datum.date}`);

        });
    } catch (err){
        return logger.error(`Error checking SFRC witnesses. `, err);
    }

    try {
        var dbData = await getData(SFRCSchema);
        var { newData, existingData } = await shallowSort({ pageData, dbData, comparer: 'title' });
        var dataToChange = await getChangedData({ existingData, model: SFRCSchema, comparer: 'title', params: ['location', 'date']}, 'witnesses');    
        logger.info(`**** New records: ${newData.length} || Records to change: ${dataToChange.length} ****`);
    } catch (err) {
        logger.error(`Error processing data. `, err);
    };


    try {
        if(newData.length > 0 ){
            await uploadNewData(newData, SFRCSchema);
            logger.info(`${newData.length} records uploaded successfully.`)
            const myMessage = await sendText({ title: 'New SFRC Meeting(s)', data: newData});
            logger.info(`${myMessage ? 'Message sent: '.concat(JSON.stringify(myMessage)) : 'Message not sent!'}`);
        };
        if(dataToChange.length > 0){
            await modifyData({ dataToChange, model: SFRCSchema });
            logger.info(`${newData.length} records modified successfully.`)
            let dataToText = dataToChange.map((datum) => datum.new);
            const myMessage = await sendText({ title: 'Updated SFRC Meeting(s)', data: dataToText});
            logger.info(`${myMessage ? 'Message sent: '.concat(JSON.stringify(myMessage)) : 'Message not sent!'}`);
        };
    } catch (err) {
        logger.error(`Error uploading or texting data. `, err);
    }
    
    try {
        await db.disconnect();
        logger.info("SFRC Done.")
    } catch (err) {
        logger.info("Error disconnecting: ", err);
    }
};