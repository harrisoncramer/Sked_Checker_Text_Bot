const find = require("../mongodb/find");
const mailer = require("../mailer");
const logger = require("../logger");
const mongoose = require("mongoose");
const moment = require("moment");

module.exports = async ({ email, schemas }) => {

    const today = moment();
    
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

    var information = schemas.map(async schema => {
        let name = schema.modelName;
        let vals = await find(schema);
        return { name, vals };
    });

    Promise.all(information)
        .then(async res => {
            try {
                debugger;
                var refined = res.map(x => {
                    return x.vals.filter(y => {
                        let itemDay = moment(y.date || y.recordListDate).valueOf();
                        let todayDay = moment(today).valueOf();
                        let diff = itemDay - todayDay;
                        return ((diff <= 604800000) && (diff > 0));
                    }).map(x => {
                        delete x.__v;
                        delete x._id;
                        return x;
                    })
                });
            } catch (err){
                logger.error("Error processing newest data", err);
            };

            try {
                await mailer({ emails: [email], text: refined, mailDuringDevelopment: true })
            } catch(err){
                logger.error("Could not mail emails ", err);
            };
            
            try {
                await db.disconnect();
            } catch (err) {
                logger.info("Error disconnecting: ", err);
            };      
        })
        .catch(err => logger.err("Could not fetch data", err));
};