const { HASCSchema } = require("../mongodb/schemas");
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

    logger.info(`Checking HASC at ${today.format("llll")}...`);

    try {
        var db = await mongoose.connect('mongodb://localhost:27017/resources', { useNewUrlParser: true, useUnifiedTopology: true });
        logger.info("Database connected.");
    } catch(err){
        return logger.error(`Could not connect to database. `, err);
    };

    try {
        await page.goto("https://armedservices.house.gov/hearings", { waitUntil: 'networkidle2' });
        logger.info("Navigated to page.");
    } catch (err) {
        return logger.error(`Could not navigate to page. `, err);
    }

    try {
        var pageData = await page.evaluate(() => {
            let trs = Array.from(document.querySelectorAll("table tbody tr"));
            let res = trs.reduce((agg, item, i) => {
                const tds = Array.from(item.children);
                tds.forEach((td) => {
                    let type = td.classList.value.split(" ").pop();
                    let val = td.textContent;
                    agg[i][type] = val;
                    td.childElementCount ? agg[i]['link'] = td.children[0].href : null;
                });
                
                return agg;
    
            }, Array(trs.length).fill().map(_ => ({})));
    
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
                return Array.from(document.querySelectorAll("div.post-content b"))
                    .map((i => i.textContent.replace(/\s\s+/g, ' ').trim()))
                    .slice(1) // Get rid of title...
                    .filter(x => !["Witnesses:", "", "Panel 1:", "Panel 2:"].includes(x));
            });
            
            datum.witnesses = witnesses;
        });
    } catch (err){
        return logger.error(`Error fetching HASC witnesses. `, err);
    }


    try {
        var dbData = await getData(HASCSchema);
        var { newData, existingData } = await sortPageData({ pageData, dbData, comparer: 'recordListTitle' });
        var dataToChange = await getChangedData({ existingData, model: HASCSchema, comparer: 'recordListTitle', params: ['recordListTime', 'recordListDate']}, 'witnesses');    
        logger.info(`**** New records: ${newData.length} || Records to change: ${dataToChange.length} ****`);
    } catch (err) {
        logger.error(`Error processing data. `, err);
    }
    
    
    try {
        if(newData.length > 0 ){
            await uploadNewData(newData, HASCSchema);
            logger.info(`${newData.length} records uploaded successfully.`)
            let myMessage = await sendText({ title: 'New HASC Meeting(s)', data: newData});
            logger.info(`${myMessage ? 'Message sent: '.concat(JSON.stringify(myMessage)) : 'Message not sent!'}`);
        };
        if(dataToChange.length > 0){
            await modifyData({ dataToChange, model: HASCSchema });
            logger.info(`${dataToChange.length} records modified successfully.`)
            let dataToText = dataToChange.map((datum) => datum.new);
            let myMessage = await sendText({ title: 'Updated HASC Meeting(s)', data: dataToText});
            logger.info(`${myMessage ? 'Message sent: '.concat(JSON.stringify(myMessage)) : 'Message not sent!'}`);
        };
    } catch (err) {
        logger.error(`Error uploading or texting data. `, err);
    }
    
    try {
        await db.disconnect();
        logger.info("HASC Done.")
    } catch (err) {
        logger.info("Error disconnecting: ", err);
    }

};