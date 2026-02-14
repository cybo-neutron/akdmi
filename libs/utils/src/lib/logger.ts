import * as winston from 'winston';

const { ENV = "development", SERVICE_NAME = "unnamed-service" } = process.env;

const { combine, timestamp, printf, colorize, errors, splat } = winston.format;

export const logger = winston.createLogger({
  level: 'http',
  format: combine(
    errors({ stack: true }),
    splat(),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss:SSS',
    }),
    colorize({ all: true }),
    printf((info: any) => {
      const { timestamp, level, message, stack, ...meta } = info;

      const jsonReplacer = (key: string, value: any) =>
        typeof value === 'bigint' ? value.toString() : value;

      let msg = message;
      if (typeof message === 'object' && message !== null) {
        msg = JSON.stringify(message, jsonReplacer, 2);
      }

      // Handle array-like metadata created by splat()
      const metaKeys = Object.keys(meta);
      const isArrayLike =
        metaKeys.length > 0 && metaKeys.every((key) => !isNaN(Number(key)));

      const metaData = isArrayLike ? Object.values(meta) : meta;

      const metaStr = metaKeys.length
        ? `${JSON.stringify(metaData, jsonReplacer, isArrayLike ? 0 : 2)}`
        : '';

      return `[${ENV} - ${SERVICE_NAME}] [${timestamp}] ${level}: ${msg}${
        stack ? `\n${stack}` : ''
      }${metaStr}`;
    })
  ),
  transports: [new winston.transports.Console()],
});
