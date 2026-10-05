import pino from 'pino';
import config from '../config/env.js';

const transport = config.nodeEnv !== 'test' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  } : undefined;

const logger = pino({
  level: config.logLevel,
  transport,
});

export default logger;
