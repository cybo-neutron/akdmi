import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors, splat } = winston.format;

export const logger = winston.createLogger({
  level: 'http',
  format: combine(
    errors({ stack: true }),
    splat(),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    colorize({all:true}),
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
        ? `\n${JSON.stringify(metaData, jsonReplacer, 2)}`
        : '';

      return `${timestamp} ${level}: ${msg}${
        stack ? `\n${stack}` : ''
      }${metaStr}`;
    })
  ),
  transports: [new winston.transports.Console()],
});
