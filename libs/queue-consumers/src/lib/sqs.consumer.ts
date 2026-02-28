import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

import { SQSConsumerConfig } from './consumer_config.interface';
import { Consumer, EventHandler } from './consumer.interface';
import { logger } from '@org/utils';

const { AWS_REGION, AWS_LOCALSTACK } = process.env;

const isLocalStack = AWS_LOCALSTACK === 'true';

export class SQSConsumer implements Consumer {
  config: SQSConsumerConfig;
  sqsClient: SQSClient;

  eventHandler: EventHandler;

  running = false;

  constructor(config: SQSConsumerConfig, eventHandler: EventHandler) {
    this.config = config;
    this.sqsClient = new SQSClient({
      region: AWS_REGION,
      credentials: { accessKeyId: '', secretAccessKey: '' },
      endpoint: isLocalStack ? 'http://localhost:4566' : undefined,
    });
    this.eventHandler = eventHandler;
  }

  async init(): Promise<void> {
    this.running = true;
    logger.info('SQS Consumer started');
    this.pollForMessages();
    // this.pollingInterval = setInterval(() => {
    //   this.pollForMessages();
    // }, 10 * 1000);
  }

  private async pollForMessages() {
    const receiveParams = {
      QueueUrl: this.config.queueUrl,
      MaxNumberOfMessages: 10, // Receive up to 10 messages at a time
      WaitTimeSeconds: 20, // Enable long polling
      VisibilityTimeout: 30, // Time other consumers can't see the message while it's being processed
    };
    try {
      const data = await this.sqsClient.send(
        new ReceiveMessageCommand(receiveParams)
      );
      if (data.Messages && data.Messages.length > 0) {
        for (const message of data.Messages) {
          logger.info(
            `Received message for ${this.config.queueUrl}: ${message.Body}`
          );

          // e.g., perform a task, update a database, etc.
          // await this.preProcessEvent(message);
          await this.processEvent(message);
          // await this.postProcessEvent(message);

          // After successful processing, delete the message
          const deleteParams = {
            QueueUrl: this.config.queueUrl,
            ReceiptHandle: message.ReceiptHandle, // Required to identify the message for deletion
          };

          await this.sqsClient.send(new DeleteMessageCommand(deleteParams));
          logger.info(
            `Message deleted for ${this.config.queueUrl}:`,
            message.MessageId
          );
        }
      } else {
        // logger.info(
        //   `No messages available for ${this.config.queueUrl}. Polling again....`
        // );
      }
    } catch (error) {
      logger.error('Error receiving message:', error);
      await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
    }

    if (this.running) {
      setImmediate(() => this.pollForMessages());
    } else {
      logger.info(`SQS Consumer stopped for ${this.config.queueUrl}`);
    }
  }

  async preProcessEvent(event: any): Promise<void> {
    logger.info('Pre processing event:', event);
    await this.eventHandler.preProcessEvent?.(event);
  }

  async processEvent(event: any): Promise<void> {
    const eventJson = JSON.parse(event.Body);
    await this.eventHandler.processEvent(eventJson);
  }

  async postProcessEvent(event: any): Promise<void> {
    logger.info('Post processing event:', event);
    await this.eventHandler.postProcessEvent?.(event);
  }

  async stop(): Promise<void> {
    logger.info(`Stopping SQS Consumer for ${this.config.queueUrl}...`);
    this.running = false;
  }
}
