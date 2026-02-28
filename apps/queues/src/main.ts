import { logger } from '@org/utils';
import { initializeVideoConsumer } from './consumers/course_video.consumer';

// Collect all shutdown callbacks so we can gracefully stop each consumer
const shutdownCallbacks: (() => Promise<void>)[] = [];

async function init() {
  const stopVideo = await initializeVideoConsumer();
  if (stopVideo) shutdownCallbacks.push(stopVideo);

}

async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  await Promise.all(shutdownCallbacks.map((cb) => cb()));
  logger.info('All consumers stopped. Exiting.');
  process.exit(0);
}

// Handle termination signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

(async () => {
  await init();
  logger.info('All consumers initialized successfully');
})().catch((error) => {
  logger.error('Error initializing consumers:', error);
  process.exit(1);
});
