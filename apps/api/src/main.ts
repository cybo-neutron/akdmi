import Fastify from 'fastify';
import { app } from './app/app';
import { logger } from '@org/utils';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

logger.info('port', port);
logger.info('host', host);

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    // server.log.error(err);
    logger.error(err);
    process.exit(1);
  } else {
    logger.info(`[ ready ] http://${host}:${port}`);
  }
});
