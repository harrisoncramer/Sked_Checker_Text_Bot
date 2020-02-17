require('dotenv').config();

const moment = require('moment');
const logger = require('./logger');

const { launchPuppeteerBots, launchAxiosBots, setupPuppeteer, setPageBlockers, setPageScripts } = require('./setup');
const setUpTorAxios = require("./setup/tor");
const getProxies = require("./setup/proxies");

// Import MongoDB
const connect = require("./mongodb/connect");

// Import bots...
const skedChecker = require('./bots/skedChecker');
const fetchChecker = require('./bots/fetchChecker');

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
  clmtBusiness,
  clmtWitnesses
} = require('./bots/guts/house');

const {
  sfrcBusiness,
  sfrcWitnesses,
  sascLayerOne,
  sascLayerTwo,
  svacBusiness,
  svacWitnesses,
  sagcBusiness,
  sagcWitnesses,
  sapcBusiness,
  sbnkBusiness,
  sbdgBusiness,
  sbdgWitnesses,
  snatBusiness,
  snatWitnesses,
  senvBusiness,
  shlpBusiness,
  shlpWitnesses,
  shscBusiness,
  shscWitnesses,
  sindBusiness,
  sindWitnesses,
  sfinBusiness,
  sfinWitnesses,
  sjudBusiness,
  sjudWitnesses,
  srleBusiness,
  srleWitnesses,
  sethBusiness,
  svetBusiness,
  svetWitnesses,
  ssciBusiness,
  ssbsBusiness,
  sstrBusiness,
} = require('./bots/guts/senate');

// Import house schemas...
const {
  HASCSchema,
  HFACSchema,
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
  CLMTSchema
} = require('./mongodb/schemas').house;

const {
    SFRCSchema,
    SASCSchema,
    SVACSchema,  
    SAGCSchema,
    SAPCSchema,
    SBNKSchema,
    SBDGSchema,
    SSTRSchema,
    SNATSchema,
    SENVSchema,
    SFINSchema,
    SHLPSchema,
    SHSCSchema,
    SINDSchema,
    SJUDSchema,
    SRLESchema,
    SETHSchema,
    SSCISchema,
    SSBSSchema,
    SVETSchema
} = require('./mongodb/schemas').senate;

let doingWork = false;
const runProgram = async () => {
  if(!doingWork){
    doingWork = true;
    logger.info(`Running program on ${moment().format("LLLL")} in ${process.env.NODE_ENV}.`);
    let startTime = new Date().valueOf();
    try {
        let db = await connect();
        let proxyData = await getProxies();
        // let { browser, page } = await setupPuppeteer({ type: 'tor' });
        // let { browser, page } = await setupPuppeteer({ type: 'proxy' });

        // await setPageBlockers(page);
        // await launchPuppeteerBots({ db, browser, page, bot: skedChecker, instances: [
        //   {
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
        //   {
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
        //   {
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
        //   {
        //     jobs: [
        //       {
        //       link: 'https://veterans.house.gov/events/hearings',
        //       type: 'hearing',
        //       layer1: page => hvacBusiness(page),
        //       layer2: uniquePage => hvacWitnesses(uniquePage)
        //       },
        //       {
        //         link: 'https://veterans.house.gov/events/markups',
        //         type: 'markup',
        //         layer1: page => hvacMarkup(page),
        //         layer2: uniquePage => hvacWitnesses(uniquePage)
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['date', 'time', 'location'],
        //     schema: HVACSchema,
        //   },
        //   {
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
        //   {
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
        //   {
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
        //     isDifferent: ['date', 'time', 'location'],
        //     schema: HBUCSchema,
        //   },
        //   {
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
        //   {
        //     jobs: [
        //       {
        //         link:
        //           'https://energycommerce.house.gov/committee-activity/hearings',
        //         type: 'hearing',
        //         layer1: page => energyBusiness(page),
        //         layer2: uniquePage => energyWitnesses(uniquePage),
        //       },
        //       {
        //         link:
        //           'https://energycommerce.house.gov/committee-activity/markups',
        //         type: 'markup',
        //         layer1: page => energyBusiness(page),
        //         layer2: uniquePage => energyMarkup(uniquePage),
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['location', 'date', 'time'],
        //     schema: NRGYSchema,
        //   },
        //   {
        //     jobs: [
        //       {
        //         link:
        //           'https://financialservices.house.gov/calendar/?EventTypeID=577&Congress=116',
        //         type: 'hearing',
        //         layer1: page => financialServicesBusiness(page),
        //         layer2: uniquePage => financialServicesWitnesses(uniquePage),
        //       },
        //       {
        //         link:
        //           'https://financialservices.house.gov/calendar/?EventTypeID=575&Congress=116',
        //         type: 'markup',
        //         layer1: page => financialServicesBusiness(page),
        //         layer2: uniquePage => financialServicesWitnesses(uniquePage),
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['location', 'date', 'time'],
        //     schema: FISVSchema,
        //   },
        //   {
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
        //         layer2: uniquePage => adminWitnesses(uniquePage),
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['location', 'date', 'time'],
        //     schema: ADMNSchema,
        //   },
        //   {
        //     jobs: [
        //       {
        //         link: 'https://naturalresources.house.gov/hearings',
        //         type: 'hearing',
        //         layer1: page => nttyBusiness(page),
        //         layer2: uniquePage => nttyWitnesses(uniquePage),
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['location', 'date', 'time'],
        //     schema: NTTYSchema,
        //   },
        //   {
        //     jobs: [
        //       {
        //         link: 'https://oversight.house.gov/legislation/hearings',
        //         type: 'hearing',
        //         layer1: page => ovstBusiness(page),
        //         layer2: uniquePage => ovstWitnesses(uniquePage),
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['location', 'date', 'time'],
        //     schema: OVSTSchema,
        //   },
        //   {
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
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['location', 'date', 'time'],
        //     schema: SCNCSchema,
        //   },
        //   {
        //     jobs: [
        //       {
        //         link: 'https://science.house.gov/hearings',
        //         type: 'hearing',
        //         layer1: page => scncBusiness(page),
        //         layer2: uniquePage => scncWitnesses(uniquePage),
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['location', 'date', 'time'],
        //     schema: SCNCSchema,
        //   },
        //   {
        //     jobs: [
        //       {
        //         link: 'https://smallbusiness.house.gov/activity/',
        //         type: 'hearing',
        //         layer1: page => smbsBusiness(page),
        //         layer2: uniquePage => smbsWitnesses(uniquePage),
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['location', 'date', 'time'],
        //     schema: SMBSSchema,
        //   },
        //   {
        //     jobs: [
        //       {
        //         link:
        //           'https://transportation.house.gov/committee-activity/hearings',
        //         type: 'hearing',
        //         layer1: page => trnsBusiness(page),
        //         layer2: uniquePage => trnsWitnesses(uniquePage),
        //       },
        //       {
        //         link:
        //           'https://transportation.house.gov/committee-activity/hearings',
        //         type: 'markup',
        //         layer1: page => trnsBusiness(page),
        //         layer2: uniquePage => trnsWitnesses(uniquePage),
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['location', 'date', 'time'],
        //     schema: TRNSSchema,
        //   },
        //   {
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
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['location', 'date', 'time'],
        //     schema: WYMNSchema,
        //   },
        //   // Intelligence Committee Hearings...
        //   {
        //     jobs: [
        //       {
        //         link: 'https://climatecrisis.house.gov/committee-activity/hearings',
        //         type: 'hearing',
        //         layer1: page => clmtBusiness(page),
        //         layer2: uniquePage => clmtWitnesses(uniquePage),
        //       },
        //       {
        //         link: 'https://climatecrisis.house.gov/committee-activity/business-meetings',
        //         type: 'markup',
        //         layer1: page => clmtBusiness(page),
        //         layer2: uniquePage => clmtWitnesses(uniquePage),
        //       },
        //     ],
        //     comparer: 'title',
        //     isDifferent: ['location', 'date', 'time'],
        //     schema: CLMTSchema,
        //   }
        // ]});
        await launchAxiosBots({ proxyData, bot: fetchChecker, instances: [
          // {
          //   jobs: [
          //     {
          //       link: 'https://www.agriculture.senate.gov/hearings',
          //       type: 'hearing',
          //       layer1: (data) => sagcBusiness(data),
          //     },
          //   ],
          //   comparer: 'title',
          //   isDifferent: ['time', 'date', 'location'],
          //   schema: SAGCSchema,
          // },
          // {
          //   jobs: [
          //     {
          //       link: 'https://www.armed-services.senate.gov/hearings',
          //       type: 'hearing',
          //       layer1: page => sascLayerOne(page),
          //       layer2: uniquePage => sascLayerTwo(uniquePage),
          //     },
          //   ],
          //   comparer: 'title',
          //   isDifferent: ['time', 'date', 'location'],
          //   schema: SASCSchema,
          // },
          // {
          //   jobs: [
          //     {
          //       link: 'https://www.foreign.senate.gov/hearings',
          //       type: 'hearing',
          //       layer1: $  => sfrcBusiness($),
          //       layer2: $ => sfrcWitnesses($),
          //     },
          //   ],
          //   comparer: 'title',
          //   isDifferent: ['time', 'date', 'location'],
          //   schema: SFRCSchema,
          // },
          // {
          //   jobs: [
          //     {
          //       link: 'https://www.veterans.senate.gov/hearings',
          //       type: 'hearing',
          //       layer1: $ => svacBusiness($),
          //       layer2: $ => svacWitnesses($),
          //     },
          //   ],
          //   comparer: 'title',
          //   isDifferent: ['time', 'date', 'location'],
          //   schema: SVACSchema,
          // },
          //{
            //jobs: [
              //{
                //link: 'https://www.appropriations.senate.gov/hearings',
                //type: 'hearing',
                //layer1: (data) => sapcBusiness(data),
              //},
            //],
            //comparer: 'title',
            //isDifferent: ['time', 'date', 'location'],
            //schema: SAPCSchema,
          //},
            //{
              //jobs: [
                //{
                  //link: 'https://www.banking.senate.gov/hearings',
                  //type: 'hearing',
                  //layer1: (data) => sbnkBusiness(data),
                //},
              //],
              //comparer: 'title',
              //isDifferent: ['time', 'date', 'location'],
              //schema: SBNKSchema,
            //},
            //{
              //jobs: [
                //{
                  //link: 'https://www.budget.senate.gov/hearings',
                  //type: 'hearing',
                  //layer1: $ => sbdgBusiness($),
                  //layer2: $ => sbdgWitnesses($),
                //},
              //],
              //comparer: 'title',
              //isDifferent: ['time', 'date', 'location'],
              //schema: SBDGSchema,
            //},
            //{
              //jobs: [
                //{
                  //link: 'https://www.energy.senate.gov/public/index.cfm/hearings-and-business-meetings',
                  //type: 'hearing',
                  //layer1: $ => snatBusiness($),
                  //layer2: $ => snatWitnesses($),
                //},
              //],
              //comparer: 'title',
              //isDifferent: ['time', 'date', 'location'],
              //schema: SNATSchema,
            //},
            //{
              //jobs: [
                //{
                  //link: 'https://www.epw.senate.gov/public/index.cfm/hearings',
                  //type: 'hearing',
                  //layer1: $ => senvBusiness($),
                //},
              //],
              //comparer: 'title',
              //isDifferent: ['time', 'date', 'location'],
              //schema: SENVSchema,
            //},
             //{
               //jobs: [
                 //{
                   //link: 'https://www.finance.senate.gov/hearings',
                   //type: 'hearing',
                   //layer1: $ => sfinBusiness($),
                   //layer2: $ => sfinWitnesses($),
                 //},
               //],
               //comparer: 'title',
               //isDifferent: ['time', 'date', 'location'],
               //schema: SFINSchema,
             //},
            //{
              //jobs: [
                //{
                  //link: 'https://www.help.senate.gov/hearings',
                  //type: 'hearing',
                  //layer1: ($) => shlpBusiness($),
                  //layer2: $ => shlpWitnesses($)
                //},
              //],
              //comparer: 'title',
              //isDifferent: ['time', 'date', 'location'],
              //schema: SHLPSchema,
            //},
            //{
              //jobs: [
                //{
                  //link: 'https://www.hsgac.senate.gov/hearings',
                  //type: 'hearing',
                  //layer1: ($) => shscBusiness($),
                  //layer2: $ => shscWitnesses($)
                //},
              //],
              //comparer: 'title',
              //isDifferent: ['time', 'date', 'location'],
              //schema: SHSCSchema,
            //},
            //{
              //jobs: [
                //{
                  //link: 'https://www.indian.senate.gov/hearings',
                  //type: 'hearing',
                  //layer1: $ => sindBusiness($),
                  //layer2: $ => sindWitnesses($)
                //},
              //],
              //comparer: 'title',
              //isDifferent: ['time', 'date', 'location'],
              //schema: SINDSchema,
            //},
            //{
              //jobs: [
                //{
                  //link: 'https://www.judiciary.senate.gov/hearings',
                  //type: 'hearing',
                  //layer1: $ => sjudBusiness($),
                  //layer2: $ => sjudWitnesses($)
                //},
              //],
              //comparer: 'title',
              //isDifferent: ['time', 'date', 'location'],
              //schema: SJUDSchema,
            //},
            //{
              //jobs: [
                //{
                  //link: 'https://www.rules.senate.gov/hearings',
                  //type: 'hearing',
                  //layer1: $ => srleBusiness($),
                  //layer2: $ => srleWitnesses($)
                //},
              //],
              //comparer: 'title',
              //isDifferent: ['time', 'date', 'location'],
              //schema: SRLESchema,
            //},
            {
              jobs: [
                {
                  link: 'https://www.veterans.senate.gov/hearings',
                  type: 'hearing',
                  layer1: $ => svetBusiness($),
                  layer2: $ => svetWitnesses($)
                },
              ],
              comparer: 'title',
              isDifferent: ['time', 'date', 'location'],
              schema: SVETSchema,
            },
          //  {
          //    jobs: [
          //      {
          //        link: '',
          //        type: 'hearing',
          //        layer1: (data) => ssciBusiness(data),
          //      },
          //    ],
          //    comparer: 'title',
          //    isDifferent: ['time', 'date', 'location'],
          //    schema: SSCISchema,
          //  },
          //  {
          //    jobs: [
          //      {
          //        link: '',
          //        type: 'hearing',
          //        layer1: (data) => ssbsBusiness(data),
          //      },
          //    ],
          //    comparer: 'title',
          //    isDifferent: ['time', 'date', 'location'],
          //    schema: SSBSSchema,
          //  },
          //  {
          //    jobs: [
          //      {
          //        link: '',
          //        type: 'hearing',
          //        layer1: (data) => sstrBusiness(data),
          //      },
          //    ],
          //    comparer: 'title',
          //    isDifferent: ['time', 'date', 'location'],
          //    schema: SSTRSchema,
          //  },
        ]});
        // await page.close();
        // await browser.close();
        await db.disconnect();
        logger.info(`Bots complete: ${moment().format("LLLL")}`);
        logger.info(`Time elapsed: ${(new Date().valueOf() - startTime)/1000} seconds.`);
        doingWork = false;
      } catch (err) {
        logger.error(`There was an error at ${moment().format("LLLL")}: `, err);
        process.exit(1);
      };
  }
  setInterval(runProgram, 1800000);
};

runProgram();
