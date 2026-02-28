import * as winston from 'winston';

const { ENV = 'development', SERVICE_NAME = 'unnamed-service' } = process.env;

const {
  combine,
  timestamp,
  printf,
  colorize,
  errors,
  splat,
  prettyPrint,
  json,
} = winston.format;

export const logger = winston.createLogger({
  level: 'http',
  format: combine(
    errors({ stack: true }),
    // splat(),
    // json(),
    // prettyPrint(),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss:SSS',
    }),
    colorize({ all: true }),
    printf((info: any) => {
      const { timestamp, level, message, stack, ...meta } = info;

      const jsonReplacer = (key: string, value: any) =>
        typeof value === 'bigint' ? value.toString() : value;

      // console.log(meta)
      const splatArgs = (meta[Symbol.for('splat') as any] as any[]) || [];

      let msg = message;
      // if (typeof message === 'object' && message !== null) {
      //   msg = JSON.stringify(message, jsonReplacer, 2);
      // }

      const rest = splatArgs
        .map((arg: any) =>
          typeof arg === 'object' ? JSON.stringify(arg, jsonReplacer, 2) : arg
        )
        .join(' ');

      return `[${ENV} - ${SERVICE_NAME}] [${timestamp}] ${level}: ${msg} ${rest}${
        stack ? `\n${stack}` : ''
      }`;
    })
  ),
  transports: [new winston.transports.Console()],
});
