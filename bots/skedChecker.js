const {asyncForEach} = require('../util');

const find = require('../mongodb/find');
const insertMany = require('../mongodb/insertMany');
const getChangedData = require('../mongodb/getChangedData');
const updateMany = require('../mongodb/updateMany');

const { sortPageData } = require('./guts');

const sendText = require('../texter');
const mongoose = require('mongoose');
const logger = require('../logger');
const saslprep = require("saslprep");

module.exports = async ({page, args}) => {
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

  try {
    await page.goto(args.link, {waitUntil: 'networkidle2'});
  } catch (err) {
    return logger.error(`Could not navigate to page. `, err);
  }

  try {
    var pageData = await args.business(page);
  } catch (err) {
    return logger.error(`Error parsing page data. `, err);
  }

  try {
    await asyncForEach(pageData, async datum => {
      await page.goto(datum.link, {waitUntil: 'networkidle2'});
      let witnesses = await args.getWitnesses(page);
      datum.witnesses = witnesses;
    });
  } catch (err) {
    return logger.error(`Error fetching ${args.schema.collection.collectionName} witnesses. `, err);
  }

  if (args.extra) {
    try {
      await page.goto(args.extra.link, {waitUntil: 'networkidle2'}); // Ensure no network requests are happening (in last 500ms).
    } catch (err) {
      return logger.error(`Could not navigate to extra page. `, err);
    }

    try {
      let extraData = await args.extra.business(page);
      pageData = pageData.concat(extraData);
    } catch (err) {
      logger.info(`Error fetching extra data `, err);
    }
  }

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
        params: [...args.params],
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
