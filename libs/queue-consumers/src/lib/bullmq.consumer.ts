import { Worker } from 'bullmq';
import { Consumer } from './consumer.interface';
import { BullMQConsumerConfig } from './consumer_config.interface';

export class BullMQConsumer implements Consumer {
  consumer: Worker;
  constructor(config: BullMQConsumerConfig) {
    this.consumer = new Worker(
      config.queueName,
      async (job) => {
        await this.processEvent(job.data);
      },
      {
        connection: config.connection,
      }
    );
  }

  async init(): Promise<void> {}

  preProcessEvent(event: any): Promise<void> {
    return Promise.resolve();
  }

  processEvent(event: any): Promise<void> {
    return Promise.resolve();
  }

  postProcessEvent(event: any): Promise<void> {
    return Promise.resolve();
  }
}
