const getData = require("../mongodb/getData");
const sortPageData = require("../mongodb/sortPageData");
const uploadNewData = require("../mongodb/uploadNewData");
const getChangedData = require("../mongodb/getChangedData");
const modifyData = require("../mongodb/modifyData");
const sendText = require("../texter");
const { HASCSchema } = require("../mongodb/schemas");
const mongoose = require("mongoose");
const logger = require("../logger");

module.exports = async ({ page, browser, today }) => {

    logger.info("Checking HASC...");

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
        var dbData = await getData(HASCSchema);
        var { newData, existingData } = await sortPageData({ pageData, dbData, comparer: 'recordListTitle' });
        var dataToChange = await getChangedData({ existingData, model: HASCSchema, comparer: 'recordListTitle' });    
        logger.info(`**** New records: ${newData.length} || Records to change: ${dataToChange.length} ****`);
    } catch (err) {
        logger.error(`Error processing data. `, err);
    }
    
    
    try {
        if(newData.length > 0 ){
            await uploadNewData(newData, HASCSchema);
            let myMessage = await sendText({ title: 'New HASC Meeting(s)', data: newData});
            logger.info(`Message sent: ${JSON.stringify(myMessage)}`);
        };
        if(dataToChange.length > 0){
            await modifyData({ dataToChange, model: HASCSchema });
            let dataToText = dataToChange.map((datum) => datum.new);
            let myMessage = await sendText({ title: 'Updated HASC Meeting(s)', data: dataToText});
            logger.info(`Message sent: ${JSON.stringify(myMessage)}`);
        };
    } catch (err) {
        logger.error(`Error uploading or texting data. `, err);
    }
    
    await db.disconnect();
    logger.info("HASC Done.");

};