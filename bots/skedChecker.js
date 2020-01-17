const { asyncForEach, handleEachJob } = require('../util');

const { setupFunctions } = require("../setup")

const find = require('../mongodb/find');
const insertMany = require('../mongodb/insertMany');
const getChangedData = require('../mongodb/getChangedData');
const updateMany = require('../mongodb/updateMany');

const { sortPageData } = require('./guts');

const sendText = require('../texter');
const mongoose = require('mongoose');
const logger = require('../logger');
const saslprep = require("saslprep");

module.exports = async ({page, browser, args}) => {
  logger.info(`Checking ${args.schema.collection.collectionName}`);
  var db;
  try {
    let uri = 'mongodb://localhost:27017/sked_checker?authSource=admin';
    let options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      keepAlive: true,
      user: 'admin',
      pass: process.env.MONGO_PASS,
    };
    db = await mongoose.connect(uri, options);
  } catch (err) {
    return logger.error(`Could not connect to database. `, err);
  }

  // Return data from first layer of job.
  let jobs = await asyncForEach(args.jobs, async job => {
    try {
      await page.goto(job.link, { waitUntil: 'networkidle2'});
    } catch (err) {
      return logger.error(`Could not navigate to page. `, err);
    }

    try {
      await setupFunctions(page);
    } catch (err) {
      return logger.error(`Could not set up helper functions `, err);
    }

    try {
      var data = await job.layer1(page);
      data = data.map(datum => ({ ...datum, type: job.type })); // Add type to every piece of data.
      return { data, work: job.layer2 };
    } catch (err) {
      return logger.error(`Error parsing page data. `, err);
    }
  });

  try {
    // For every job, create pages from the numbers of links 
    var pageData = await handleEachJob({ jobs, browser }, async ({ job, browser }) => {
        let { work, data } = job;
        
        try {
          var pages = await Promise.all(data.map(_ => browser.newPage()));
        } catch(err){
          return logger.error(`Could not open pages. `, err);
        };
        
        try {
          await Promise.all(pages.map((page, i) => page.goto(data[i].link), {waitUntil: 'networkidle2'}));
        } catch (err){
          return logger.error(`Could not navigate to pages. `, err);
        }

        try {
          var layerTwoData = await Promise.all(pages.map(async uniquePage => {
            try {
              await setupFunctions(uniquePage)
            } catch(err){
              return logger.error(`Could not set up helper functions for unique page. `, err);
            }
            let newData = await work(uniquePage);
            let link = uniquePage.url();
            return { ...newData, link }; // Combine the data gathered with the link from the page.
          }));
        } catch(err){
          return logger.error(`Could not produce layerTwo data. `, err);
        }
       
        // Combine the layerOne data and layerTwo data with reduction on link.
        let combinedData = data.reduce((agg, datum, i) => {
          let match = layerTwoData.filter(x => x.link.toLowerCase() === datum.link.toLowerCase())[0];
          agg[i] = { ...datum, ...match};
          return agg;
        }, []);

        try {
          await Promise.all(pages.map(page => page.close()));
        } catch(err){
          return logger.error(`Could not exit pages. `, err);
        }

      return combinedData;
    });
  } catch (err) {
    return logger.error(`Error fetching ${args.schema.collection.collectionName} additional details. `, err);
  };

  pageData = pageData.flatten(); /// Flatten all jobs into single array for processing. Added as array prototype in util.

  try {
    var dbData = await find(args.schema);
    var {newData, existingData} = await sortPageData({
      pageData,
      dbData,
      comparer: args.comparer,
    });
    var {dataToChange, dataToText} = await getChangedData(
      {
        existingData,
        model: args.schema,
        comparer: args.comparer,
        isDifferent: [...args.isDifferent],
      },
      'witnesses',
    );
    logger.info(
      `**** New records: ${newData.length} || Records to change: ${dataToChange.length} ****`,
    );
  } catch (err) {
    logger.error(`Error processing data. `, err);
  }

  try {
    if (newData.length > 0) {
      await insertMany(newData, args.schema);
      logger.info(`${newData.length} records uploaded successfully.`);
    }
    if (dataToChange.length > 0) {
      await updateMany({dataToChange, model: args.schema});
      logger.info(`${dataToChange.length} records modified successfully.`);
    }
  } catch (err) {
    logger.error(`Error uploading data. `, err);
  }

  try {
    if (newData.length > 0) {
      let myMessage = await sendText({
        title: `New ${args.schema.collection.collectionName} Meeting(s)`,
        data: newData,
      });
      logger.info(
        `${
          myMessage
            ? 'Message sent: '.concat(JSON.stringify(myMessage))
            : 'Message not sent, running in development.'
        }`,
      );
    }
    if (dataToChange.length > 0) {
      let myMessage = await sendText({
        title: `Updated ${args.schema.collection.collectionName} Meeting(s)`,
        data: dataToText,
      });
      logger.info(
        `${
          myMessage
            ? 'Message sent: '.concat(JSON.stringify(myMessage))
            : 'Message not sent, running in development.'
        }`,
      );
    }
  } catch (err) {
    logger.error(`Error texting data. `, err);
  }

  try {
    await db.disconnect();
    logger.info(`${args.schema.collection.collectionName} Done.`);
  } catch (err) {
    logger.info('Error disconnecting: ', err);
  }
};
