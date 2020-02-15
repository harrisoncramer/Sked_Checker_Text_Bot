const mongoose = require('mongoose');

const dat = {
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
    SFRCSchema: mongoose.model('SFRC', dat),
    SASCSchema: mongoose.model('SASC', dat),
    SVACSchema: mongoose.model('SVAC', dat),  
    SAGCSchema: mongoose.model('SAGC', dat),
    SAPCSchema: mongoose.model('SAPC', dat),
    SBNKSchema: mongoose.model('SBNK', dat),
    SBDGSchema: mongoose.model('SBDG', dat),
    SSTRSchema: mongoose.model('SSTR', dat),
    SNATSchema: mongoose.model('SNAT', dat),
    SENVSchema: mongoose.model('SENV', dat),
    SFINSchema: mongoose.model('SFIN', dat),
    SHLPSchema: mongoose.model('SHLP', dat),
    SHSCSchema: mongoose.model('SHSC', dat),
    SINDSchema: mongoose.model('SIND', dat),
    SJUDSchema: mongoose.model('SJUD', dat),
    SRLESchema: mongoose.model('SRLE', dat),
    SETHSchema: mongoose.model('SETH', dat),
    SSCISchema: mongoose.model('SSCI', dat),
    SSBSSchema: mongoose.model('SSBS', dat),
    SVETSchema: mongoose.model('SVET', dat)
  },
  // House Committees
  house: {
    HASCSchema: mongoose.model('HASC', dat),
    HFACSchema: mongoose.model('HFAC', dat),
    HVACSchema: mongoose.model('HVAC', dat),
    HHSCSchema: mongoose.model('HHSC', dat),
    HAGCSchema: mongoose.model('HAGC', dat),
    HAPCSchema: mongoose.model('HAPC', dat),
    HBUCSchema: mongoose.model('HBUC', dat),
    HELPSchema: mongoose.model('HELP', dat),
    NRGYSchema: mongoose.model('NRGY', dat),
    FISVSchema: mongoose.model('FISV', dat),
    ADMNSchema: mongoose.model('ADMN', dat),
    NTTYSchema: mongoose.model('NTTY', dat),
    OVSTSchema: mongoose.model('OVST', dat),
    SCNCSchema: mongoose.model('SCNC', dat),
    SMBSSchema: mongoose.model('SMBS', dat),
    TRNSSchema: mongoose.model('TRNS', dat),
    WYMNSchema: mongoose.model('WYMN', dat),
    CLMTSchema: mongoose.model('CLMT', dat),
  }
};
