const mongoose = require('mongoose');

const basicDataStructure = {
    title: {
      type: String,
      require: true,
    },
    time: {
      type: String,
      require: true,
    },
    date: {
      type: String,
      require: true,
    },
    link: {
      type: String,
      require: true,
    },
    witnesses: {
      type: Array,
      require: true,
    }
};

const modifiedDataStructure = {
  recordListTitle: {
    type: String,
    require: true,
  },
  recordListTime: {
    type: String,
    require: true,
  },
  recordListDate: {
    type: String,
    require: true,
  },
  link: {
    type: String,
    require: true,
  },
  witnesses: {
    type: Array,
    require: true,
  }
};

module.exports = {
  // Senate Committees
  SFRCSchema: mongoose.model('SFRC', basicDataStructure),
  SASCSchema: mongoose.model('SASC', basicDataStructure),
  SVACSchema: mongoose.model('SVAC', basicDataStructure),
  // House Committees
  HASCSchema: mongoose.model('HASC', modifiedDataStructure),
  HFACSchema: mongoose.model('HFAC', modifiedDataStructure),
  HVACSchema: mongoose.model('HVAC', basicDataStructure),
  HHSCSchema: mongoose.model('HHSC', basicDataStructure),
  HAGCSchema: mongoose.model('HAGC', { 
    ...basicDataStructure,
    witnesses: {
      required: false,
      type: Array
    }
  }),
  HAPCSchema: mongoose.model('HAPC', basicDataStructure),
  HBUCSchema: mongoose.model('HBUC', basicDataStructure),
};
