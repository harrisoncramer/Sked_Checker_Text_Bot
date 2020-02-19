const winston = require('winston');
const { format, transports } = require('winston')
const fs = require('fs');
const path = require('path');
const logDir = 'logger/logs';
const moment = require('moment');

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Return the last folder name in the path and the calling
// module's filename.
const getLabel = function(callingModule) {
  const parts = callingModule.filename.split(path.sep);
  return path.join(parts[parts.length - 2], parts.pop());
};


const filename =
  process.env.NODE_ENV === 'production'
    ? path.join(logDir, 'results.log')
    : path.join(logDir, 'dev-results.log');

module.exports = (callingModule) => winston.createLogger({
  transports: [
    new transports.Console({
      // silent: !!process.env.TEST_ENV,
      // level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.errors({ stack: true }),
        format.printf(info => {
          const message = info[Symbol.for('splat')]
            ? info.message + ' - ' + info[Symbol.for('splat')][0]
            : info.message;
          return `[${moment(info.timestamp).format('lll')}][${getLabel(callingModule)}][${info.level}]: ${message}`;
        }),
      ),
    }),
    new transports.File({
      filename,
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.errors({ stack: true }),
        format.printf(info => {
          const message = info[Symbol.for('splat')]
            ? info.message + ' - ' + info[Symbol.for('splat')][0]
            : info.message;
          return `[${moment(info.timestamp).format('lll')}][${getLabel(callingModule)}][${info.level}]: ${message}`;
        }),
      ),
    }),
  ],
});
