const mongoose = require('mongoose');
const logger = require('../../logger')(module);

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
  logger.info('Connected to MongoDb.');

  process.on('SIGINT', async () => {
    logger.info('SIGINT SIGNAL RECIEVED');
    try {
      await db.disconnect();
      logger.info('Closed DB Connection.');
      process.exit(0);
    } catch (err) {
      logger.error('There was a problem closing the db', err);
      process.exit(1);
    }
  });
  
  return db;

};
