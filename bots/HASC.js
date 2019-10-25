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
    const db = await mongoose.connect('mongodb://localhost:27017/resources', { useNewUrlParser: true });
    await page.goto("https://armedservices.house.gov/hearings", { waitUntil: 'networkidle2' }); // Ensure no network requests are happening (in last 500ms).

    // Fetch data from page...
    const pageData = await page.evaluate(() => {
        let trs = Array.from(document.querySelectorAll("table tbody tr")).slice(1, Array.from(document.querySelectorAll("table tr")).length);
        let res = trs.reduce((agg, item, i) => {
            const tds = Array.from(item.children);
            tds.forEach((td) => {
                let type = td.classList.value.split(" ").pop();
                let val = td.textContent;
                agg[i][type] = val;
                td.childElementCount ? agg[i]['link'] = td.children[0].href : null;
            });
            
            return agg;

        }, Array(trs.length).fill({length: 10 }).map(_ => ({})));

        return res;
    });
    
    // Get database data (dbData)
    const dbData = await getData(HASCSchema);
    // Split page data into two categories: new data, and data that already exists...
    const { newData, existingData } = await sortPageData({pageData, dbData, comparer: 'recordListTitle' });
    // Determine whether any existingData requires changes...
    const dataToChange = await getChangedData({ existingData, model: HASCSchema, comparer: 'recordListTitle' });
    
    // Upload new data.
    if(newData.length > 0 ){
        await uploadNewData(newData, HASCSchema);
        const message = await sendText({ title: 'New HASC Meeting(s)', data: newData});
      //  logger.info(`Message sent: ${JSON.stringify(messsage)}`);
    };
    // Modify data that needs to change.
    if(dataToChange.length > 0){
        await modifyData({ dataToChange, model: HASCSchema });
        let dataToText = dataToChange.map((datum) => datum.new);
        const message = await sendText({ title: 'Updated HASC Meeting(s)', data: dataToText});
        // logger.info(`Message sent: ${JSON.stringify(messsage.to)}`);
    };
    
    await db.disconnect();
};