import {Consumer, EachMessagePayload} from "kafkajs";

export type EachKafkaMessageCallbackFunction = (payload: EachMessagePayload, consumer: Consumer) => Promise<void>

export interface KafkaConsumerOptions {
    fromBeginning?: boolean;
    autoCommit?:  boolean;
    partitionsConsumedConcurrently?:  number;
}

export interface KafkaConsumer {
    consumer: Consumer;
    callback: EachKafkaMessageCallbackFunction;
    topic: string;
    consumerGroupName: string;
    options?: KafkaConsumerOptions;
    connected: boolean;
}

interface KafkaConsumerConfig {
    consumerGroupName: string;
    callback: EachKafkaMessageCallbackFunction;
    topic: string;
    options?: KafkaConsumerOptions;
}

export type RegisterKafkaConsumer = Record<string, KafkaConsumerConfig>

export interface KafkaMessage {
    short_url_id: string;
}

export interface UpdateKafkaMessage extends KafkaMessage {
    long_url: string;
}