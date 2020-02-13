const mongoose = require('mongoose');

const basicDataStructure = {
  type: {
    type: String,
    require: true
  },
  link: {
    type: String,
    require: true,
  },
  title: {
    type: String,
    require: true,
  },
  date: {
    type: String,
    require: true,
  },
  time: {
    type: String,
    require: true,
  },
  location: {
    type: String,
    required: false,
  },
  witnesses: {
    type: Array,
    require: false,
  },
  isSubcommittee: {
    type: Boolean,
    require: true,
  },
  subcommittee: {
    type: String,
    require: false
  },
};

module.exports = {
  // Senate Committees
  senate: {
    SFRCSchema: mongoose.model('SFRC', basicDataStructure),
    SASCSchema: mongoose.model('SASC', basicDataStructure),
    SVACSchema: mongoose.model('SVAC', basicDataStructure),  
    SAGCSchema: mongoose.model('SAGC', basicDataStructure),
  },
  // House Committees
  house: {
    HASCSchema: mongoose.model('HASC', basicDataStructure),
    HFACSchema: mongoose.model('HFAC', basicDataStructure),
    HVACSchema: mongoose.model('HVAC', basicDataStructure),
    HHSCSchema: mongoose.model('HHSC', basicDataStructure),
    HAGCSchema: mongoose.model('HAGC', basicDataStructure),
    HAPCSchema: mongoose.model('HAPC', basicDataStructure),
    HBUCSchema: mongoose.model('HBUC', basicDataStructure),
    HELPSchema: mongoose.model('HELP', basicDataStructure),
    NRGYSchema: mongoose.model('NRGY', basicDataStructure),
    FISVSchema: mongoose.model('FISV', basicDataStructure),
    ADMNSchema: mongoose.model('ADMN', basicDataStructure),
    NTTYSchema: mongoose.model('NTTY', basicDataStructure),
    OVSTSchema: mongoose.model('OVST', basicDataStructure),
    SCNCSchema: mongoose.model('SCNC', basicDataStructure),
    SMBSSchema: mongoose.model('SMBS', basicDataStructure),
    TRNSSchema: mongoose.model('TRNS', basicDataStructure),
    WYMNSchema: mongoose.model('WYMN', basicDataStructure),
    CLMTSchema: mongoose.model('CLMT', basicDataStructure),
  }
};
