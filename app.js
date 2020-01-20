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
  financialServicesBusiness,
  financialServicesWitnesses,
  adminBusiness,
  adminWitnesses,
  nttyBusiness,
  nttyWitnesses,
  ovstBusiness,
  ovstWitnesses,
  scncBusiness,
  scncWitnesses,
  smbsBusiness,
  smbsWitnesses,
  trnsBusiness,
  trnsWitnesses,
  wymnBusiness,
  wymnWitnesses,
  intlBusiness,
  intlWitnesses,
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
  FISVSchema,
  ADMNSchema,
  NTTYSchema,
  OVSTSchema,
  SCNCSchema,
  SMBSSchema,
  TRNSSchema,
  WYMNSchema,
} = require('./mongodb/schemas');

// Run program...
if (process.env.NODE_ENV === 'production') {
  logger.info(
    `Starting up bots in ${process.env.NODE_ENV} at ${moment().format('llll')}`,
  );

  // Schedule bots...
  cron.schedule('*/1 * * * *', async () => {
    try {
      var { browser, page } = await setUpPuppeteer();
      var today = moment();
      logger.info(`Running program at ${today.format('llll')}`);
    }
    catch (err) {
      logger.error(`Could not set up puppeteer: `, err);
    }

    try {
      await launchBots({
        page,
        browser,
        bots: [
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://foreignaffairs.house.gov/hearings',
                  type: 'hearing',
                  layer1: page =>
                    getLinks({
                      page,
                      selectors: {
                        boxSelectors: 'table tbody tr',
                        linkSelectors: 'a',
                      },
                    }),
                  layer2: uniquePage => hfacLayerTwo(uniquePage),
                },
                {
                  link: 'https://foreignaffairs.house.gov/markups',
                  type: 'markup',
                  layer1: page =>
                    getLinks({
                      page,
                      selectors: {
                        boxSelectors: 'table tbody tr',
                        linkSelectors: 'a',
                      },
                    }),
                  layer2: uniquePage => hfacLayerTwo(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['time', 'date', 'location'],
              schema: HFACSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://armedservices.house.gov/hearings',
                  type: 'hearing',
                  layer1: page => hascLayerOne(page),
                  layer2: uniquePage => hascLayerTwo(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['time', 'date', 'location'],
              schema: HASCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://www.armed-services.senate.gov/hearings',
                  type: 'hearing',
                  layer1: page => sascLayerOne(page),
                  layer2: uniquePage => sascLayerTwo(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['time', 'date', 'location'],
              schema: SASCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://www.foreign.senate.gov/hearings',
                  type: 'hearing',
                  layer1: page => sfrcBusiness(page),
                  layer2: uniquePage => sfrcWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['time', 'date', 'location'],
              schema: SFRCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://www.veterans.senate.gov/hearings',
                  type: 'hearing',
                  layer1: page => svacBusiness(page),
                  layer2: uniquePage => svacWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['time', 'date', 'location'],
              schema: SVACSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://homeland.house.gov/activities/hearings',
                  type: 'hearing',
                  layer1: page => hhscBusiness(page),
                  layer2: uniquePage => hhscWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['time', 'date', 'location'],
              schema: HHSCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://agriculture.house.gov/calendar/',
                  type: 'hearing',
                  layer1: page => hagcBusiness(page),
                  layer2: uniquePage => hagcWitnessesAndLocation(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['date', 'time'],
              schema: HAGCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link:
                    'https://appropriations.house.gov/events/hearings?subcommittee=All&congress_number=752',
                  type: 'hearing',
                  layer1: page => hapcBusinessAndMarkup(page),
                  layer2: uniquePage => hapcWitnesses(uniquePage),
                },
                {
                  link: 'https://appropriations.house.gov/events/markups',
                  type: 'markup',
                  layer1: page => hapcBusinessAndMarkup(page),
                  layer2: uniquePage => hapcWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['date', 'time', 'location'],
              schema: HAPCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://budget.house.gov/legislation/hearings',
                  type: 'hearing',
                  layer1: page => hbucBusinessAndMarkup(page),
                  layer2: uniquePage => hbucWitnessesAndLocation(uniquePage),
                },
                {
                  link: 'https://budget.house.gov/legislation/markups',
                  type: 'markup',
                  layer1: page => hbucBusinessAndMarkup(page),
                  layer2: uniquePage => hbucWitnessesAndLocation(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['date', 'time', 'location', 'witnesses'],
              schema: HBUCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://edlabor.house.gov/hearings-and-events',
                  type: 'hearing',
                  layer1: page => helpBusiness(page),
                  layer2: uniquePage => helpWitnessesAndTime(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: HELPSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link:
                    'https://energycommerce.house.gov/committee-activity/hearings',
                  type: 'hearing',
                  layer1: page => energyBusiness(page),
                  layer2: uniquePage => energyWitnesses(uniquePage),
                },
                {
                  link:
                    'https://energycommerce.house.gov/committee-activity/markups',
                  type: 'markup',
                  layer1: page => energyBusiness(page),
                  layer2: uniquePage => energyMarkup(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: NRGYSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link:
                    'https://financialservices.house.gov/calendar/?EventTypeID=577&Congress=116',
                  type: 'hearing',
                  layer1: page => financialServicesBusiness(page),
                  layer2: uniquePage => financialServicesWitnesses(uniquePage),
                },
                {
                  link:
                    'https://financialservices.house.gov/calendar/?EventTypeID=575&Congress=116',
                  type: 'markup',
                  layer1: page => financialServicesBusiness(page),
                  layer2: uniquePage => financialServicesWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: FISVSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://cha.house.gov/committee-activity/hearings',
                  type: 'hearing',
                  layer1: page => adminBusiness(page),
                  layer2: uniquePage => adminWitnesses(uniquePage),
                },
                {
                  link: 'https://cha.house.gov/committee-activity/markups',
                  type: 'markup',
                  layer1: page => adminBusiness(page),
                  layer2: uniquePage => adminWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: ADMNSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://naturalresources.house.gov/hearings',
                  type: 'hearing',
                  layer1: page => nttyBusiness(page),
                  layer2: uniquePage => nttyWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: NTTYSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://oversight.house.gov/legislation/hearings',
                  type: 'hearing',
                  layer1: page => ovstBusiness(page),
                  layer2: uniquePage => ovstWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: OVSTSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://science.house.gov/hearings',
                  type: 'hearing',
                  layer1: page => scncBusiness(page),
                  layer2: uniquePage => scncWitnesses(uniquePage),
                },
                {
                  link: 'https://science.house.gov/markups',
                  type: 'markup',
                  layer1: page => scncBusiness(page),
                  layer2: uniquePage => scncWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: SCNCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://science.house.gov/hearings',
                  type: 'hearing',
                  layer1: page => scncBusiness(page),
                  layer2: uniquePage => scncWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: SCNCSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://smallbusiness.house.gov/activity/',
                  type: 'hearing',
                  layer1: page => smbsBusiness(page),
                  layer2: uniquePage => smbsWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: SMBSSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link:
                    'https://transportation.house.gov/committee-activity/hearings',
                  type: 'hearing',
                  layer1: page => trnsBusiness(page),
                  layer2: uniquePage => trnsWitnesses(uniquePage),
                },
                {
                  link:
                    'https://transportation.house.gov/committee-activity/hearings',
                  type: 'markup',
                  layer1: page => trnsBusiness(page),
                  layer2: uniquePage => trnsWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: TRNSSchema,
            },
          },
          {
            bot: skedChecker,
            args: {
              jobs: [
                {
                  link: 'https://waysandmeans.house.gov/legislation/hearings',
                  type: 'hearing',
                  layer1: page => wymnBusiness(page),
                  layer2: uniquePage => wymnWitnesses(uniquePage),
                },
                {
                  link: 'https://waysandmeans.house.gov/legislation/markups',
                  type: 'markup',
                  layer1: page => wymnBusiness(page),
                  layer2: uniquePage => wymnWitnesses(uniquePage),
                },
              ],
              comparer: 'title',
              isDifferent: ['location', 'date', 'time'],
              schema: TRNSSchema,
            },
          },
        ],
      });

      await page.close();
      await browser.close();
      logger.info(`Chrome Closed Bots.`);
    } catch (err) {
      logger.error('Error launching bots: ', err);
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
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://energycommerce.house.gov/committee-activity/hearings',
      //         type: 'hearing',
      //         layer1: page => energyBusiness(page),
      //         layer2: uniquePage => energyWitnesses(uniquePage),
      //       },
      //       {
      //         link: 'https://energycommerce.house.gov/committee-activity/markups',
      //         type: 'markup',
      //         layer1: page => energyBusiness(page),
      //         layer2: uniquePage => energyMarkup(uniquePage)
      //       }
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['location', 'date', 'time'],
      //     schema: NRGYSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://financialservices.house.gov/calendar/?EventTypeID=577&Congress=116',
      //         type: 'hearing',
      //         layer1: page => financialServicesBusiness(page),
      //         layer2: uniquePage => financialServicesWitnesses(uniquePage),
      //       },
      //       {
      //         link: 'https://financialservices.house.gov/calendar/?EventTypeID=575&Congress=116',
      //         type: 'markup',
      //         layer1: page => financialServicesBusiness(page),
      //         layer2: uniquePage => financialServicesWitnesses(uniquePage)
      //       }
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['location', 'date', 'time'],
      //     schema: FISVSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://cha.house.gov/committee-activity/hearings',
      //         type: 'hearing',
      //         layer1: page => adminBusiness(page),
      //         layer2: uniquePage => adminWitnesses(uniquePage),
      //       },
      //       {
      //         link: 'https://cha.house.gov/committee-activity/markups',
      //         type: 'markup',
      //         layer1: page => adminBusiness(page),
      //         layer2: uniquePage => adminWitnesses(uniquePage)
      //       }
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['location', 'date', 'time'],
      //     schema: ADMNSchema,
      //   },
      // });

      // //
      //   // JUDICIARY COMMITTEE
      // //

      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://naturalresources.house.gov/hearings',
      //         type: 'hearing',
      //         layer1: page => nttyBusiness(page),
      //         layer2: uniquePage => nttyWitnesses(uniquePage),
      //       }
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['location', 'date', 'time'],
      //     schema: NTTYSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://oversight.house.gov/legislation/hearings',
      //         type: 'hearing',
      //         layer1: page => ovstBusiness(page),
      //         layer2: uniquePage => ovstWitnesses(uniquePage),
      //       }
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['location', 'date', 'time'],
      //     schema: OVSTSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://science.house.gov/hearings',
      //         type: 'hearing',
      //         layer1: page => scncBusiness(page),
      //         layer2: uniquePage => scncWitnesses(uniquePage),
      //       },
      //       {
      //         link: 'https://science.house.gov/markups',
      //         type: 'markup',
      //         layer1: page => scncBusiness(page),
      //         layer2: uniquePage => scncWitnesses(uniquePage),
      //       }
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['location', 'date', 'time'],
      //     schema: SCNCSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://science.house.gov/hearings',
      //         type: 'hearing',
      //         layer1: page => scncBusiness(page),
      //         layer2: uniquePage => scncWitnesses(uniquePage),
      //       }
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['location', 'date', 'time'],
      //     schema: SCNCSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://smallbusiness.house.gov/activity/',
      //         type: 'hearing',
      //         layer1: page => smbsBusiness(page),
      //         layer2: uniquePage => smbsWitnesses(uniquePage),
      //       }
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['location', 'date', 'time'],
      //     schema: SMBSSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://transportation.house.gov/committee-activity/hearings',
      //         type: 'hearing',
      //         layer1: page => trnsBusiness(page),
      //         layer2: uniquePage => trnsWitnesses(uniquePage),
      //       },
      //       {
      //         link: 'https://transportation.house.gov/committee-activity/hearings',
      //         type: 'markup',
      //         layer1: page => trnsBusiness(page),
      //         layer2: uniquePage => trnsWitnesses(uniquePage),
      //       }
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['location', 'date', 'time'],
      //     schema: TRNSSchema,
      //   },
      // });
      // await skedChecker({
      //   page,
      //   browser,
      //   args: {
      //     jobs: [
      //       {
      //         link: 'https://waysandmeans.house.gov/legislation/hearings',
      //         type: 'hearing',
      //         layer1: page => wymnBusiness(page),
      //         layer2: uniquePage => wymnWitnesses(uniquePage),
      //       },
      //       {
      //         link: 'https://waysandmeans.house.gov/legislation/markups',
      //         type: 'markup',
      //         layer1: page => wymnBusiness(page),
      //         layer2: uniquePage => wymnWitnesses(uniquePage),
      //       }
      //     ],
      //     comparer: 'title',
      //     isDifferent: ['location', 'date', 'time'],
      //     schema: TRNSSchema,
      //   },
      // });

      // INTELLIGENCE COMMITTE HEARINGS...

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
