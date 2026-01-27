import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors, splat } = winston.format;

export const logger = winston.createLogger({
  level: 'http',
  format: combine(
    errors({ stack: true }),
    splat(),
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    printf((info: any) => {
      const { timestamp, level, message, stack, ...meta } = info;

      let msg = message;
      if (typeof message === 'object') {
        msg = JSON.stringify(message, null, 2);
      }

      const metaStr = Object.keys(meta).length
        ? `\n${JSON.stringify(
            meta,
            (key, value) =>
              typeof value === 'bigint' ? value.toString() : value,
            2
          )}`
        : '';

      return `${timestamp} ${level}: ${msg}${
        stack ? `\n${stack}` : ''
      }${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
