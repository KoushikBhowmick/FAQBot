const winston = require('winston');
const logger = new (winston.Logger)({
	level: 'verbose',
	//format: winston.format.json(),
	transports: [
		new winston.transports.Console({ level: 'verbose', timestamp: true }),
		//
		// - Write to all logs with level `info` and below to `combined.log` 
		// - Write all logs error (and below) to `error.log`.
		//
		new winston.transports.File({ name: 'error', filename: './error.log', level: 'error', timestamp: true }),
		new winston.transports.File({ name: 'all', filename: './combined.log', timestamp: true })
	]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
//   if (process.env.NODE_ENV !== 'production') {
// 	logger.add(new winston.transports.Console({
// 	  format: winston.format.simple()
// 	}));
//   }
module.exports = logger;