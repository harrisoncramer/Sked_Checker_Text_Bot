const {asyncForEach, handleEachJob} = require('../util');

const {setPageBlockers, setPageScripts } = require('../setup');

const find = require('../mongodb/methods/find');
const insertMany = require('../mongodb/methods/insertMany');
const getChangedData = require('../mongodb/methods/getChangedData');
const updateMany = require('../mongodb/methods/updateMany');

const {sortPageData} = require('./guts');

const logger = require('../logger');

module.exports = async ({page, browser, db, args}) => {

  const { schema, comparer, isDifferent, jobs } = args;
  const jobName = schema.collection.collectionName;
  logger.info(`${jobName} > Running.`)

  let layerOneData = await asyncForEach(jobs, async job => {
      await page.goto(job.link);
      await setPageScripts(page);
      var data = await job.layer1(page);
      data = data.map(datum => ({...datum, type: job.type})); // Add type to every piece of data.
      return {data, work: job.layer2};
  });

  logger.info(`${jobName} > Info gathered from first layer.`);

  let pageData = await handleEachJob({layerOneData, browser}, async ({job, browser}) => {
    let { work, data } = job;
    var pages = await Promise.all(data.map(_ => browser.newPage()));
    await Promise.all(pages.map(async(page, i) => {
      await setPageBlockers(page);
      logger.info(`i: ${i}`);
      logger.info(`data: ${JSON.stringify(data)}`);
      logger.info(`data[i]: ${JSON.stringify(data[i])}`);
      logger.info(`data[i].link: ${JSON.stringify(data[i].link)}`);
      return page.goto(data[i].link);
    }));
    let layerTwoData = await Promise.all(pages.map(async uniquePage => {
      await setPageScripts(uniquePage);
      let newData = await work(uniquePage);
      let link = uniquePage.url();
      return {...newData, link}; // Combine the data gathered with the link from the page.
    }));
    let combinedData = data.reduce((agg, datum, i) => {
      let match = layerTwoData.filter(x => x.link.toLowerCase() === datum.link.toLowerCase())[0];
      agg[i] = {...datum, ...match};
      return agg;
    }, []);
    await Promise.all(pages.map(page => page.close()));
    return combinedData;
  });

  logger.info(`${jobName} > Info gathered and combined from second layer.`);

  pageData = pageData.flatten();
  let dbData = await find(schema);
  let { newData, existingData } = await sortPageData({ pageData, dbData, comparer });
  let { dataToChange, dataToText } = await getChangedData({ existingData, model: schema, comparer: comparer, isDifferent: [...isDifferent] }, 'witnesses');
  logger.info(newData.length + dataToChange.length > 0 ? `${jobName} > ${newData.length + dataToChange.length} record(s) to change or modify...` : `${jobName} > No new records...`);
  
  if (newData.length > 0) {
    await insertMany(newData, schema);
    logger.info(`${jobName} > ${newData.length} records uploaded successfully.`);
  }
  if (dataToChange.length > 0) {
    await updateMany({dataToChange, model: schema});
    logger.info(`${jobName} > ${dataToChange.length} records modified successfully.`);
  }
};
