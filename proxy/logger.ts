import pino from 'pino';

export const logLevel = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(
  process.env.LOG_LEVEL ?? ''
)
  ? process.env.LOG_LEVEL
  : 'debug';

const options: pino.LoggerOptions = { level: logLevel, base: {} };
export const logger = pino(options);
