import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

export const logger = winston.createLogger({
  level: 'http',
  format: combine(
    colorize({ all: true }),
    errors({ stack: true }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    printf(
      (info: any) =>
        `${info.timestamp} ${info.level}: ${info.message} ${
          info.stack ? `\n${info.stack}` : ''
        }`
    )
  ),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({
    //   filename: "combined.log",
    // }),
    // new winston.transports.File({
    //   filename: "error.log",
    //   level: "error",
    // }),
  ],
});
