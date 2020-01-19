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
    require: true,
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
  location: {
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
  },
};

module.exports = {
  // Senate Committees
  SFRCSchema: mongoose.model('SFRC', basicDataStructure),
  SASCSchema: mongoose.model('SASC', basicDataStructure),
  SVACSchema: mongoose.model('SVAC', basicDataStructure),
  // House Committees
  HASCSchema: mongoose.model('HASC', basicDataStructure),
  HFACSchema: mongoose.model('HFAC', basicDataStructure),
  HVACSchema: mongoose.model('HVAC', basicDataStructure),
  HHSCSchema: mongoose.model('HHSC', basicDataStructure),
  HAGCSchema: mongoose.model('HAGC', {
    ...basicDataStructure,
    witnesses: {
      required: false,
      type: Array,
    },
  }),
  HAPCSchema: mongoose.model('HAPC', basicDataStructure),
  HBUCSchema: mongoose.model('HBUC', basicDataStructure),
  HELPSchema: mongoose.model('HELP', basicDataStructure),
  NRGYSchema: mongoose.model('NRGY', basicDataStructure),
  FISVSchema: mongoose.model('FISV', basicDataStructure)
};
