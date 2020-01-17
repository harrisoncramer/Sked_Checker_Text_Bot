require('dotenv').config({path: '../envs/sked_checker.env'});

const cron = require('node-cron');
const moment = require('moment');
const logger = require('./logger');

// Import utility functions...
const {launchBots, setUpPuppeteer} = require('./setup');

// Import bots...
const skedChecker = require('./bots/skedChecker');
const outlook = require('./bots/outlook');

// Import business logic...
const {
  getLinks,
  hfacLayerTwo,
  hascLayerOne,
  hascLayerTwo,
  hvacBusiness,
  hvacWitnesses,
  hvacMarkup,
  hhscBusiness,
  hhscWitnesses,
  hagcBusiness,
  hagcWitnessesAndLocation,
  hapcBusinessAndMarkup,
  hapcWitnesses,
  hbucBusinessAndMarkup,
  hbucWitnessesAndLocation,
  helpBusiness,
  helpMarkup,
  helpWitnessesAndTime,
  energyBusiness,
  energyMarkup,
  energyWitnesses,
} = require('./bots/guts/house');

const {
  sfrcBusiness,
  sfrcWitnesses,
  sascLayerOne,
  sascLayerTwo,
  svacBusiness,
  svacWitnesses,
} = require('./bots/guts/senate');

// Import schemas...
const {
  SASCSchema,
  SFRCSchema,
  HASCSchema,
  HFACSchema,
  SVACSchema,
  HVACSchema,
  HHSCSchema,
  HAGCSchema,
  HAPCSchema,
  HBUCSchema,
  HELPSchema,
  NRGYSchema,
} = require('./mongodb/schemas');

// Run program...
if (process.env.NODE_ENV === 'production') {
  logger.info(
    `Starting up bots in ${process.env.NODE_ENV} at ${moment().format('llll')}`,
  );

  // Schedule bots...
  cron.schedule('*/15 * * * *', async () => {
    try {
      let {browser, page} = await setUpPuppeteer();
      let today = moment();
      logger.info(`Running program at ${today.format('llll')}`);

      await launchBots({
        page,
        browser,
        bots: [
          {
            bot: skedChecker,
            args: {
              link: 'https://www.foreign.senate.gov/hearings',
              business: sfrcBusiness,
              getAdditionalData: sfrcWitnesses,
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: SFRCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              link: 'https://www.armed-services.senate.gov/hearings',
              business: sascLayerOne,
              getAdditionalData: sascLayerTwo,
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: SASCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              link: 'https://foreignaffairs.house.gov/hearings',
              business: hfacGetLinks,
              getAdditionalData: hfacLayerTwo,
              comparer: 'recordListTitle',
              schema: HFACSchema,
              isDifferent: ['recordListTime', 'recordListDate'],
            },
          },
          {
            bot: skedChecker,
            args: {
              link: 'https://armedservices.house.gov/hearings',
              business: hascLayerTwo,
              getAdditionalData: hascWitnesses,
              comparer: 'recordListTitle',
              schema: HASCSchema,
              isDifferent: ['recordListTime', 'recordListDate'],
            },
          },
          {
            bot: skedChecker,
            args: {
              link: 'https://www.veterans.senate.gov/hearings',
              business: svacBusiness,
              getAdditionalData: svacWitnesses,
              comparer: 'title',
              schema: HVACSchema,
              isDifferent: ['location', 'date', 'time'],
            },
          },
        ],
      });

      await page.close();
      await browser.close();
      logger.info(`Chrome Closed Bots.`);
    } catch (err) {
      logger.error('Root Error.', err);
    }
  });

  // Email for outlook...
  cron.schedule('55 10 * * 5', async () => {
    try {
      await outlook({
        schemas: [SASCSchema, SFRCSchema, HASCSchema, HFACSchema],
        email: process.env.EMAIL,
      });
    } catch (err) {
      logger.error('Could not send hearings', err);
    }
  });
} else {
  (async () => {
    try {
      let {browser, page} = await setUpPuppeteer();

      let today = moment();
      logger.info(`Running program at ${today.format('llll')}`);
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://foreignaffairs.house.gov/hearings',
      //         type: 'hearing',
      //         layer1: page =>
      //           getLinks({
      //             page,
      //             selectors: {
      //               boxSelectors: 'table tbody tr',
      //               linkSelectors: 'a',
      //             },
      //           }),
      //         layer2: uniquePage => hfacLayerTwo(uniquePage),
      //       },
      //       {
      //         link: 'https://foreignaffairs.house.gov/markups',
      //         type: 'markup',
      //         layer1: page =>
      //           getLinks({
      //             page,
      //             selectors: {
      //               boxSelectors: 'table tbody tr',
      //               linkSelectors: 'a',
      //             },
      //           }),
      //         layer2: uniquePage => hfacLayerTwo(uniquePage),
      //       },
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['time', 'date', 'location'],
      //     schema: HFACSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://armedservices.house.gov/hearings',
      //         type: 'hearing',
      //         layer1: page => hascLayerOne(page),
      //         layer2: uniquePage => hascLayerTwo(uniquePage),
      //       },
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['time', 'date', 'location'],
      //     schema: HASCSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://www.armed-services.senate.gov/hearings',
      //         type: 'hearing',
      //         layer1: page => sascLayerOne(page),
      //         layer2: uniquePage => sascLayerTwo(uniquePage),
      //       },
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['time', 'date', 'location'],
      //     schema: SASCSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://www.foreign.senate.gov/hearings',
      //         type: 'hearing',
      //         layer1: page => sfrcBusiness(page),
      //         layer2: uniquePage => sfrcWitnesses(uniquePage),
      //       },
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['time', 'date', 'location'],
      //     schema: SFRCSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://www.veterans.senate.gov/hearings',
      //         type: 'hearing',
      //         layer1: page => svacBusiness(page),
      //         layer2: uniquePage => svacWitnesses(uniquePage),
      //       },
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['time', 'date', 'location'],
      //     schema: SVACSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://veterans.house.gov/events/hearings',
      //         type: 'hearing',
      //         layer1: page => hvacBusiness(page),
      //         layer2: uniquePage => hvacWitnesses(uniquePage),
      //       },
      //       {
      //         link: 'https://veterans.house.gov/events/markups',
      //         type: 'markup',
      //         layer1: page => hvacBusiness(page),
      //         layer2: uniquePage => hvacMarkup(uniquePage),
      //       },
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['time', 'date', 'location'],
      //     schema: HVACSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://homeland.house.gov/activities/hearings',
      //         type: 'hearing',
      //         layer1: page => hhscBusiness(page),
      //         layer2: uniquePage => hhscWitnesses(uniquePage),
      //       },
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['time', 'date', 'location'],
      //     schema: HHSCSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://agriculture.house.gov/calendar/',
      //         type: 'hearing',
      //         layer1: page => hagcBusiness(page),
      //         layer2: uniquePage => hagcWitnessesAndLocation(uniquePage),
      //       },
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['date', 'time'],
      //     schema: HAGCSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link:
      //           'https://appropriations.house.gov/events/hearings?subcommittee=All&congress_number=752',
      //         type: 'hearing',
      //         layer1: page => hapcBusinessAndMarkup(page),
      //         layer2: uniquePage => hapcWitnesses(uniquePage),
      //       },
      //       {
      //         link: 'https://appropriations.house.gov/events/markups',
      //         type: 'markup',
      //         layer1: page => hapcBusinessAndMarkup(page),
      //         layer2: uniquePage => hapcWitnesses(uniquePage),
      //       },
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['date', 'time', 'location'],
      //     schema: HAPCSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://budget.house.gov/legislation/hearings',
      //         type: 'hearing',
      //         layer1: page => hbucBusinessAndMarkup(page),
      //         layer2: uniquePage => hbucWitnessesAndLocation(uniquePage),
      //       },
      //       {
      //         link: 'https://budget.house.gov/legislation/markups',
      //         type: 'markup',
      //         layer1: page => hbucBusinessAndMarkup(page),
      //         layer2: uniquePage => hbucWitnessesAndLocation(uniquePage),
      //       },
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['date', 'time', 'location', 'witnesses'],
      //     schema: HBUCSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://edlabor.house.gov/hearings-and-events',
      //         type: 'hearing',
      //         layer1: page => helpBusiness(page),
      //         layer2: uniquePage => helpWitnessesAndTime(uniquePage),
      //       },
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['location', 'date', 'time'],
      //     schema: HELPSchema,
      //   },
      // });
      await skedChecker({
        page,
        browser,
        args: {
          jobs: [
            {
              link: 'https://energycommerce.house.gov/committee-activity/hearings',
              type: 'hearing',
              layer1: page => energyBusiness(page),
              layer2: uniquePage => energyWitnesses(uniquePage),
            },
            {
              link: 'https://energycommerce.house.gov/committee-activity/markups',
              type: 'markup',
              layer1: page => energyBusiness(page),
              layer2: uniquePage => energyMarkup(uniquePage)
            }
          ],
          comparer: 'title',
          isDifferent: ['location', 'date', 'time'],
          schema: NRGYSchema,
        },
      });      

      // await outlook({
      //   schemas: [SASCSchema, SFRCSchema, HASCSchema, HFACSchema],
      //   email: process.env.EMAIL,
      // });

      await page.close();
      await browser.close();
      logger.info(`Chrome Closed Bots.`);
    } catch (err) {
      logger.error('Root Error in development. ', err);
    }
  })();
}
