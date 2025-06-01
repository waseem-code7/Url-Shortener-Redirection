import {Kafka, Consumer} from "kafkajs";
import {EachKafkaMessageCallbackFunction, KafkaConsumer, KafkaConsumerOptions} from "../interfaces/kafka";
import consumers from "../configs/consumers";
const utils = require("../common/utils");
const logger = utils.getLogger();

class KafkaConsumerService {
    private static instance: KafkaConsumerService
    private readonly brokers!: string[]
    private kafka: Kafka
    private readonly kafkaConsumers: Record<string, KafkaConsumer>;

    private constructor() {

        const brokers = process.env.KAFKA_BROKERS || "";
        if (brokers.length === 0) {
            throw new Error("kafka brokers not found!")
        }
        if (brokers) {
            this.brokers = brokers.split(",")
        }
        this.kafka = new Kafka({
            clientId: "URL_REDIRECTION_CONSUMER",
            brokers: this.brokers,
        })
        this.kafkaConsumers = {}
    }

    public static getInstance(): KafkaConsumerService {
        if (!KafkaConsumerService.instance) {
            KafkaConsumerService.instance = new KafkaConsumerService();
        }
        return KafkaConsumerService.instance;
    }

    private async connectAndSubscribe() {
        const connectionPromises = []
        for (const [groupName, consumer] of Object.entries(this.kafkaConsumers)) {
            logger.info(`Connecting and subscribing to ${groupName}...`)
            connectionPromises.push(
                new Promise(async (resolve, reject) => {
                    try {
                        await consumer.consumer.connect()
                        await consumer.consumer.subscribe({
                            topic: consumer.topic,
                            fromBeginning: consumer.options?.fromBeginning ?? false
                        })
                        consumer.connected = true;
                        return resolve({})
                    }
                    catch (err) {
                            logger.error(`Failed to connect to ${groupName}! :: ${utils.getErrorMessage(err)}`)
                            consumer.connected = false;
                            return resolve({})
                        }
                    })
            )
        }
        await Promise.all(connectionPromises)
    }

    private runConsumers() {
        const runPromises = [];
        for (const [groupName, consumer] of Object.entries(this.kafkaConsumers)) {
            if(consumer.connected) {
                runPromises.push(consumer.consumer.run({
                    autoCommit: consumer.options?.autoCommit ?? false,
                    partitionsConsumedConcurrently: consumer.options?.partitionsConsumedConcurrently ?? 2,
                    eachMessage: async (message) => {
                        return await consumer.callback(message, consumer.consumer)
                    }
                }))
            }
        }
        return Promise.allSettled(runPromises)
    }

    public async startConsumers() {
        await this.connectAndSubscribe()
        return this.runConsumers()
    }

    public registerConsumer(topic: string, consumerGroupName: string, callback: EachKafkaMessageCallbackFunction, options: KafkaConsumerOptions = {}) {
        this.kafkaConsumers[consumerGroupName] = {
            consumerGroupName: consumerGroupName,
            topic: topic,
            callback: callback,
            consumer: this.kafka.consumer({ groupId: consumerGroupName }),
            options: options,
            connected: false
        }
    }

    public async shutDownConsumers() {
        const shutDownPromises = [];
        for(const [groupName, consumer] of Object.entries(this.kafkaConsumers)) {
            if(consumer.connected) {
                shutDownPromises.push(new Promise(async (resolve, reject) => {
                    try {
                        await consumer.consumer.stop();
                        await consumer.consumer.disconnect();
                        return resolve({})
                    }
                    catch (e) {
                        logger.error(`Failed to disconnect / stop ${groupName}! :: ${utils.getErrorMessage(e)}`)
                        return reject(e)
                    }
                }))
            }
        }
        await Promise.all(shutDownPromises);
    }
}

export default KafkaConsumerService;