const logger = require("../logger");

module.exports = async (newData, Model) => {
    try {
        const insertMany = await Model.insertMany(newData);
        return insertMany;
    } catch(err) {
        logger.error(err);
    }
};