import { Consumer } from './consumer.interface';
import { RabbitMQConsumerConfig } from './consumer_config.interface';

export class RabbitMQConsumer implements Consumer {
  constructor(config: RabbitMQConsumerConfig) {}

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
