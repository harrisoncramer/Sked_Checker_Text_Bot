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
  hfacBusiness,
  hfacWitnessesAndLocation,
  hascBusiness,
  hascWitnesses,
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
} = require('./bots/guts/house');

const {
  sfrcBusiness,
  sfrcWitnesses,
  sascBusiness,
  sascWitnesses,
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
              business: sascBusiness,
              getAdditionalData: sascWitnesses,
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: SASCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              link: 'https://foreignaffairs.house.gov/hearings',
              business: hfacBusiness,
              getAdditionalData: hfacWitnessesAndLocation,
              comparer: 'recordListTitle',
              schema: HFACSchema,
              isDifferent: ['recordListTime', 'recordListDate'],
            },
          },
          {
            bot: skedChecker,
            args: {
              link: 'https://armedservices.house.gov/hearings',
              business: hascBusiness,
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
       //   args: {
       //     link: 'https://foreignaffairs.house.gov/hearings',
       //     business: hfacBusiness,
       //     getAdditionalData: hfacWitnessesAndLocation,
       //     comparer: 'recordListTitle',
       //     isDifferent: ['recordListTime', 'recordListDate', 'location'],
       //     schema: HFACSchema,
       //   },
       // });
       // await skedChecker({
       //   page,
       //   args: {
       //     link: 'https://armedservices.house.gov/hearings',
       //     business: hascBusiness,
       //     getAdditionalData: hascWitnesses,
       //     comparer: 'recordListTitle',
       //     isDifferent: ['recordListTime', 'recordListDate'],
       //     schema: HASCSchema,
       //   },
       // });
       await skedChecker({
         page,
         args: {
           link: 'https://www.armed-services.senate.gov/hearings',
           business: sascBusiness,
           getAdditionalData: sascWitnesses,
           comparer: 'title',
           isDifferent: ['location', 'date', 'time'],
           schema: SASCSchema,
         },
       });
       await skedChecker({
         page,
         args: {
           link: 'https://www.foreign.senate.gov/hearings',
           business: sfrcBusiness,
           getAdditionalData: sfrcBusiness,
           comparer: 'title',
           isDifferent: ['location', 'date', 'time'],
           schema: SFRCSchema,
         },
       });
       await skedChecker({
         page,
         args: {
           link: 'https://www.veterans.senate.gov/hearings',
           business: svacBusiness,
           getAdditionalData: svacWitnesses,
           comparer: 'title',
           schema: SVACSchema,
           isDifferent: ['location', 'date', 'time'],
         },
       });
       await skedChecker({
         page,
         args: {
           link: 'https://veterans.house.gov/events/hearings',
           extra: {
             link: 'https://veterans.house.gov/events/markups',
             business: hvacMarkup,
           },
           business: hvacBusiness,
           getAdditionalData: hvacWitnesses,
           comparer: 'title',
           schema: HVACSchema,
           isDifferent: ['location', 'date', 'time'],
         },
       });
       await skedChecker({
         page,
         args: {
           link: 'https://homeland.house.gov/activities/hearings',
           business: hhscBusiness,
           getAdditionalData: hhscWitnesses,
           comparer: 'title',
           schema: HHSCSchema,
           isDifferent: ['location', 'date', 'time'],
         },
       });
       await skedChecker({
         page,
         args: {
           link: 'https://agriculture.house.gov/calendar/',
           business: hagcBusiness,
           getAdditionalData: hagcWitnessesAndLocation,
           schema: HAGCSchema,
           comparer: 'title',
           isDifferent: ['date', 'time'],
         }
       });
       await skedChecker({
         page,
         args: {
           link: 'https://appropriations.house.gov/events/hearings?subcommittee=All&congress_number=752',
           business: hapcBusinessAndMarkup,
           getAdditionalData: hapcWitnesses,
           extra: {
             link: 'https://appropriations.house.gov/events/markups',
             business: hapcBusinessAndMarkup,
           },
           schema: HAPCSchema,
           comparer: 'title',
           isDifferent: ['date', 'time', 'location'],
         },
       });
       await skedChecker({
         page,
         args: {
           link: 'https://budget.house.gov/legislation/hearings',
           business: hbucBusinessAndMarkup,
           getAdditionalData: hbucWitnessesAndLocation,
           extra: {
             link: 'https://budget.house.gov/legislation/markups',
             business: hbucBusinessAndMarkup
           },
           schema: HBUCSchema,
           comparer: 'title',
           isDifferent: ['date', 'time', 'location', 'witnesses']
         }
       })
      await skedChecker({
        page,
        args: {
          link: 'https://edlabor.house.gov/hearings-and-events',
          business: helpBusiness,
          getAdditionalData: helpWitnessesAndTime,
               extra: {
                 link: 'https://budget.house.gov/legislation/markups',
                 business: helpMarkup
               },
          schema: HELPSchema,
          comparer: 'title',
          isDifferent: ['location', 'date', 'time'],
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
