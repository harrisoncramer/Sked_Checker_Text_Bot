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

module.exports = {
  HFACSchema: mongoose.model('HFAC', {
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
    },
  }),
  SFRCSchema: mongoose.model('SFRC', basicDataStructure),
  HASCSchema: mongoose.model('HASC', {
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
    },
  }),
  SASCSchema: mongoose.model('SASC', basicDataStructure),
  HVACSchema: mongoose.model('HVAC', basicDataStructure),
  SVACSchema: mongoose.model('SVAC', basicDataStructure),
  HHSCSchema: mongoose.model('HHSC', basicDataStructure),
  HAGCSchema: mongoose.model('HAGC', basicDataStructure),
};
