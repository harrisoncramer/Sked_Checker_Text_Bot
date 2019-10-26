const getData = require("../mongodb/getData");
const sortPageData = require("../mongodb/sortPageData");
const uploadNewData = require("../mongodb/uploadNewData");
const getChangedData = require("../mongodb/getChangedData");
const modifyData = require("../mongodb/modifyData");
const sendText = require("../texter");
const { SASCSchema } = require("../mongodb/schemas");
const mongoose = require("mongoose");
const logger = require("../logger");

module.exports = async ({ page, browser, today }) => {
    logger.info("Checking SASC...");
    const db = await mongoose.connect('mongodb://localhost:27017/resources', { useNewUrlParser: true });
    await page.goto("https://www.armed-services.senate.gov/hearings", { waitUntil: 'networkidle2' }); // Ensure no network requests are happening (in last 500ms).

    // Fetch data from page...
    const pageData = await page.evaluate(() => {
        let trs = Array.from(document.querySelectorAll("table tbody tr.vevent"));
        let res = trs.reduce((agg, item, i) => {
            console.log(tds)
            const tds = Array.from(item.children);
            let link = tds[0].children[0].href;
            let title = tds[0].children[0].textContent.trim();
            let location = tds[1].children[0].textContent.trim();
            let date = tds[2].children[0].textContent.trim();
            agg[i] = { link, title, location, date };
            return agg;
        }, Array(trs.length).fill().map(_ => ({})));

        return res;
    });
    
    // Get database data (dbData)
    const dbData = await getData(SASCSchema);
    // Split page data into two categories: new data, and data that already exists...
    const { newData, existingData } = await sortPageData({pageData, dbData, comparer: 'recordListTitle' });
    // Determine whether any existingData requires changes...
    const dataToChange = await getChangedData({ existingData, model: SASCSchema, comparer: 'recordListTitle' });
    
    // Upload new data.
    if(newData.length > 0 ){
        await uploadNewData(newData, SASCSchema);
        const message = await sendText({ title: 'New HASC Meeting(s)', data: newData});
      //  logger.info(`Message sent: ${JSON.stringify(messsage)}`);
    };
    // Modify data that needs to change.
    if(dataToChange.length > 0){
        await modifyData({ dataToChange, model: SASCSchema });
        let dataToText = dataToChange.map((datum) => datum.new);
        const message = await sendText({ title: 'Updated HASC Meeting(s)', data: dataToText});
        // logger.info(`Message sent: ${JSON.stringify(messsage.to)}`);
    };
    
    await db.disconnect();
};