const twilio = require('twilio')

module.exports = async ({ title, data }) => {
    try {

        let body = data.reduce((agg, datum, i) => {
            let vals = Object.values(datum);
            vals.forEach((x, i) => {
                agg = i < vals.length -1 ? agg.concat(x).concat(" || ") : agg.concat(x);
            });
            agg = agg.concat("\n\n");
            return agg;
        }, '');

        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        let message = await client.messages.create({
            body: title.concat("\n\n").concat(body),
            from: process.env.TWILIO_FROM,
            to: process.env.TWILIO_TO
       });

       return message;

    } catch (err) {
        logger.error(err);
    }
};