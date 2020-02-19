const logger = require("../../logger")(module);
const { asyncForEach } = require("../../util");
module.exports = async ({ dataToChange, model }) => {
    try {
        await asyncForEach(dataToChange, async (datum) => {
            let _id = datum.old._id;
            let newData = datum.new;
            delete newData._id; // Necessary to avoid update error, cannot modify _id...
            await model.updateOne({ _id }, { $set: { ...newData }});
        });
    } catch(err){
        logger.error(`Failed to modify data`, err);
    }
};