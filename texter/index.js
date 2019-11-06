const twilio = require('twilio')
const logger = require("../logger");

module.exports = async ({ title, data }) => {
    try {

        let body = data.reduce((agg, datum, i) => {
            let vals = Object.values(datum);
            vals.forEach((x, i) => {
                if(x){
                    agg = i < vals.length -1 ? agg.concat(x).concat(" || ") : agg.concat(x);
                }
            });
            agg = agg.concat("\n\n");
            return agg;
        }, '').trim();

        // Deal w/ extra long messages over 1600 words....

        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        let message = process.env.NODE_ENV === 'production' ? await client.messages.create({
            body: title.concat("\n\n").concat(body),
            from: process.env.TWILIO_FROM,
            to: process.env.TWILIO_TO
       }) : false;

       return message;

    } catch (err) {
        logger.error(err);
    }
};

