const logger = require("../../logger");

module.exports = async (newData, Model) => {
    try {
      debugger;
        const insertMany = await Model.insertMany(newData);
      debugger;
        return insertMany;
    } catch(err) {
      debugger;
      logger.error(`MongoDB/Mongoose Error`);
      throw err;
    }
};
