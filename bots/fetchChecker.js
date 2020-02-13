const rp = require("request-promise");
const cheerio = require("cheerio");
const randomUser = require('random-useragent');
const { asyncForEach, handleEachJob } = require('../util');
const find = require('../mongodb/methods/find');
const insertMany = require('../mongodb/methods/insertMany');
const getChangedData = require('../mongodb/methods/getChangedData');
const updateMany = require('../mongodb/methods/updateMany');

const { sortPageData, cleanupData } = require('./guts');
const logger = require('../logger');

module.exports = async ({ proxyData, args }) => {
  const { schema, comparer, isDifferent, jobs } = args;
  const jobName = schema.collection.collectionName;
  logger.info(`${jobName} > Running.`);
  
  // Setup proxy + request options
  const proxy = `http://${proxyData.ip}:${proxyData.port}/`;
  const proxiedRequest = rp.defaults({ proxy });
  const userAgentString = randomUser.getRandom();
  let options = { headers: { 'User-Agent': userAgentString }};

  let layerOneData = await asyncForEach(jobs, async job => {
      try {
        let res = await proxiedRequest.get(job.link, options);
        logger.info(`${jobName} > Data fetched from first page.`);
        let cleaned = res.replace(/[\t\n]+/g,' ');
        let $ = cheerio.load(cleaned);
        let data = await job.layer1($);
        data = data.map(datum => ({...datum, type: job.type})); // Add type to every piece of data.
        return {data, work: job.layer2};
      } catch (err) {
        logger.info(`Website could not be reached through ${proxy}. `, err);
        return { data: [], work: job.layer2 };
      }
  });

  logger.info(`${jobName} > Info gathered from first layer.`);

  let combinedData = await asyncForEach(layerOneData, async layer => {
    await Promise.all(layer.data.map(async datum => {
      try {
        let res = await proxiedRequest.get(datum.link, options);
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
    
  logger.info(`${jobName} > Info gathered and combined from second layer.`);

  let dbData = await find(schema);
  let { newData, existingData } = await sortPageData({ combinedData, dbData, comparer });
  let { dataToChange, dataToText } = await getChangedData({ existingData, model: schema, comparer: comparer, isDifferent: [...isDifferent] }, 'witnesses');
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
