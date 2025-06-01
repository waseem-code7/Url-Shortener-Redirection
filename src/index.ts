import express, {Express} from "express";
import DynamoDbClient from "./services/dynamodb"
import RedisService from "./services/redis"
import routes from "./routers/app.router";
import consumers from "./configs/consumers"
import KafkaConsumerService from "./services/kafka";

require('dotenv').config()

const utils = require("./common/utils");
const logger = utils.getLogger();

const app: Express = express();


// middleware
app.use(express.json())

app.use(function (req, res, next) {
    logger.info(`${req.method} / ${req.path}`);
    next();
})

app.use('/', routes)

function startServer(callback: () => void) {
    console.log("Initiating server startup...!");
    const PORT = process.env.PORT || "4003";

    return app.listen(PORT, () => {
        console.log(`Server startup successful, running on port ${PORT}!`);
        callback();
    });
}


async function releaseResourceGracefully(kafkaConsumerService: KafkaConsumerService, redisService: RedisService, dynamoDbClient: DynamoDbClient) {
    try {
        const promises = [];
        promises.push(kafkaConsumerService.shutDownConsumers());
        promises.push(redisService.close());
        promises.push(dynamoDbClient.close());
        await Promise.all(promises);
    }
    catch (error) {
        logger.error(`Failed to shutdown server gracefully! ${utils.getErrorMessage(error)}`);
    }
}

process.on("unhandledRejection", (error: Error) => {
    logger.error(utils.getErrorMessage(error))
});

(async () => {
    try {
        logger.info("Connecting to kafka...")
        const kafkaConsumerInstance = KafkaConsumerService.getInstance()

        for (const [key, consumerConfig] of Object.entries(consumers)) {
            kafkaConsumerInstance.registerConsumer(consumerConfig.topic, consumerConfig.consumerGroupName, consumerConfig.callback, consumerConfig.options)
        }

        kafkaConsumerInstance.startConsumers()

        logger.info("Connection to kafka cluster successful");
        const dynamodbClientInstance = DynamoDbClient.getInstance()
        const redisInstance = await RedisService.getInstance()
        logger.info("DB & cache initialization successful, attempting to start server...")

        const server = startServer(() => {});

        process.on("SIGTERM", async (signal) => {
            logger.info(`SIGTERM ${signal} received, Initiating server shutdown`);
            server.close(async (err) => {
                if (err) {
                    logger.error("Error closing HTTP server", err);
                    process.exit(1);
                }
                await releaseResourceGracefully (kafkaConsumerInstance, redisInstance, dynamodbClientInstance)
                logger.info("Shutdown complete. Exiting process.");
                process.exit(0);
            })
        });

        process.on("SIGINT", async (signal) => {
            logger.info(`SIGINT ${signal} received, Initiating server shutdown`);
            server.close(async (err) => {
                if (err) {
                    logger.error("Error closing HTTP server", err);
                    process.exit(1);
                }
                await releaseResourceGracefully (kafkaConsumerInstance, redisInstance, dynamodbClientInstance)
                logger.info("Shutdown complete. Exiting process.");
                process.exit(0);
            })
        });
    } catch (err) {
        console.error('Error:', err);
    }
})();










