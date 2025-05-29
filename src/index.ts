import {Express} from "express";
import express from "express";
import DynamoDbClient from "./services/dynamodb"
import RedisService from "./services/redis"
import routes from "./routers/app.router";
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

    app.listen(PORT, () => {
        console.log(`Server startup successful, running on port ${PORT}!`);
        callback();
    })
}

(async () => {
    try {
        DynamoDbClient.getInstance()
        await RedisService.getInstance()
        logger.info("DB & cache initialization successful, attempting to start server...")
        startServer(() => {});
    } catch (err) {
        console.error('Error:', err);
    }
})();










