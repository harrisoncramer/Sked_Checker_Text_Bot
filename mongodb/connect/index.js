const mongoose = require("mongoose");
const logger = require("../../logger")(module);

module.exports = async () => {
  let uri = 'mongodb://localhost:27017/sked_checker?authSource=admin';
  
  let options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    keepAlive: true,
    user: 'admin',
    pass: process.env.MONGO_PASS,
  };
  
  let db = await mongoose.connect(uri, options);
  logger.info("Connected to MongoDb.")
  return db;  
};