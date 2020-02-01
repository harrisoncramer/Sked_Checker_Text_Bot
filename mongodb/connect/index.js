const mongoose = require("mongoose");
const logger = require("../../logger");

module.exports = async () => {
  let uri = 'mongodb://localhost:27017/sked_checker?authSource=admin';
  
  let options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    keepAlive: true,
    user: 'admin',
    pass: process.env.MONGO_PASS,
  };
  
  logger.info("Connecting to MongoDb...")
  let db = await mongoose.connect(uri, options);
  return db;  
};