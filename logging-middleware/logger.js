const fs = require('fs');

const logger = {
  log: (level, msg) => {
    const txt = `[${new Date().toISOString()}] [${level}] ${msg}`;
    console.log(txt);
    if(typeof window === 'undefined') {
      fs.appendFileSync('app.log', txt + '\n');
    }
  },
  info: msg => logger.log('INFO', msg),
  warn: msg => logger.log('WARN', msg),
  error: msg => logger.log('ERROR', msg)
};

module.exports = { logger };
