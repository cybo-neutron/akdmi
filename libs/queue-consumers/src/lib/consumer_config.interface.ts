export interface KafkaConsumerConfig {
  clientId: string;
  brokers: string[];
  topic: string;
}

export interface BullMQConsumerConfig {
  connection: {
    host: string;
    port: number;
    password?: string;
  };
  queueName: string;
}

export interface RabbitMQConsumerConfig {
  host: string;
  queueName: string;
}

export interface SQSConsumerConfig {
  queueUrl: string;
}

export interface ConsumerConfig {
  type: string;
  config: KafkaConsumerConfig | BullMQConsumerConfig | RabbitMQConsumerConfig;
}

