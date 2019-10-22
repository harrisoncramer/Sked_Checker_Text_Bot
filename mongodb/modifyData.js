const logger = require("../logger");
const { asyncForEach } = require("../util");
module.exports = async ({ dataToChange, model }) => {
    try {
        await asyncForEach(dataToChange, async (datum) => {
            let _id = datum.old._id;
            let newData = datum.new;
            delete newData._id; // Necessary to avoid update error, cannot modify _id...
            let res = await model.updateOne({ _id }, { $set: { ...newData }});
            logger.info(res);
        });
    } catch(err){
        logger.error(err);
    }
};