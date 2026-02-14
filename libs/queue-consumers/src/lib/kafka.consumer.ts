import { Consumer } from './consumer.interface';
import { KafkaConsumerConfig } from './consumer_config.interface';

export class KafkaConsumer implements Consumer {
  config: KafkaConsumerConfig;
  constructor(config: KafkaConsumerConfig) {
    this.config = config;
  }

  async init(): Promise<void> {}

  async preProcessEvent(event: any): Promise<void> {
    return Promise.resolve();
  }

  async processEvent(event: any): Promise<void> {
    return Promise.resolve();
  }

  async postProcessEvent(event: any): Promise<void> {
    return Promise.resolve();
  }
}
