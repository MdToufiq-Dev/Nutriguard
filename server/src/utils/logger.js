import pino from 'pino';
import config from '../config/env.js';

// No transport for now to avoid thread-stream instability
const logger = pino({
  level: config.logLevel,
});

export default logger;
