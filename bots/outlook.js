const find = require("../mongodb/find");
const mailer = require("../mailer");
const logger = require("../logger");
const mongoose = require("mongoose");
const { HFACSchema } = require("../mongodb/schemas");
const { asyncForEach } = require("../util");
const moment = require("moment");

module.exports = async ({ email, schemas }) => {

    try {
        var db = await mongoose.connect('mongodb://localhost:27017/resources', { useNewUrlParser: true, useUnifiedTopology: true });
    } catch(err){
        return logger.error(`Could not connect to database. `, err);
    };

    var information = schemas.map(async schema => {
        let name = schema.modelName;
        let vals = await find(schema);
        return { name, vals };
    });

    Promise.all(information)
        .then(async res => {
            try {
                let refined = res.map(x => {
                    return x.vals.filter(y => {
                        console.log(moment(y.date).valueOf, moment(today).valueOf);
                        moment(y.date).valueOf > moment().valueOf 
                    });
                });
                console.log(refined);
            } catch (err){
                logger.error(err);
            }
           
        })
        .catch(err => logger.error(err));
    
    // Promise.all(information)
    //     .then(async res => {
    //         console.log(res);

    //         try {
    //             await db.disconnect();
    //             logger.info(`${args.type} Done.`)
    //         } catch (err) {
    //             logger.info("Error disconnecting: ", err);
    //         };        
    //     })
    //     .catch(err => logger.error('Could not fetch data', err));
        // await mailer({ emails: [email], text: text, mailDuringDevelopment: false });
};