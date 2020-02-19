const cheerio = require("cheerio");
const { asyncForEach, requestPromiseRetry } = require('../util');
const find = require('../mongodb/methods/find');
const insertMany = require('../mongodb/methods/insertMany');
const getChangedData = require('../mongodb/methods/getChangedData');
const updateMany = require('../mongodb/methods/updateMany');

const { sortPageData } = require('./guts');
const logger = require('../logger')(module);

module.exports = async ({ proxyData, args }) => {
  const { schema, comparer, isDifferent, jobs } = args;
  const jobName = schema.collection.collectionName;

  let layerOneData = await asyncForEach(jobs, async job => {
      try {
        let res = await requestPromiseRetry(job.link, 5, proxyData, jobName);
        logger.info(`${jobName} > Data fetched from first page.`);
        let cleaned = res.replace(/[\t\n]+/g,' ');
        let $ = cheerio.load(cleaned);
        let data = job.layer1($);
        data = data.map(datum => ({...datum, type: job.type})); // Add type to every piece of data.
        return {data, work: job.layer2};
      } catch (err) {
        logger.error(`${jobName} > Could not reach ${job.link}`);
        throw new Error(err);
      }
  });

  logger.info(`${jobName} > Data processed from first layer.`);

  let pageData = !layerOneData[0].work ? layerOneData[0].data : await asyncForEach(layerOneData, async layer => {
    return await Promise.all(layer.data.map(async datum => {
      try {
        let res = await requestPromiseRetry(datum.link, 5, proxyData, jobName);
        let cleaned = res.replace(/[\t\n]+/g,' ');
        let $ = cheerio.load(cleaned);
        let newData = await layer.work($);
        logger.info(`${jobName} > data extracted from page ${datum.link}`);
        return { ...datum, ...newData }; // Combine the data gathered with the link from the page.
      } catch (err) {
        logger.error(`Error on page ${datum.link}: `, err);
        return datum;
      }
    }));
  });

  pageData = pageData.flatten(); // Flatten the array of data into a single array.
    
  logger.info(`${jobName} > ${!layerOneData[0].work ? 'No second layer job.' : 'Second layer data combined.' }`);

  let dbData = await find(schema);
  let { newData, existingData } = await sortPageData({ pageData, dbData, comparer });
  let { dataToChange } = await getChangedData({ existingData, model: schema, comparer: comparer, isDifferent: [...isDifferent] }, 'witnesses');
  logger.info(newData.length + dataToChange.length > 0 ? `${jobName} > ${newData.length + dataToChange.length} record(s) to change or modify...` : `${jobName} > No new records.`);
  
  if (newData.length > 0) {
    await insertMany(newData, schema);
    logger.info(`${jobName} > ${newData.length} records uploaded successfully.`);
  }
  if (dataToChange.length > 0) {
    await updateMany({dataToChange, model: schema});
    logger.info(`${jobName} > ${dataToChange.length} records modified successfully.`);
  }
};
