import {Express} from "express";
import express from "express";
import DynamoDbClient from "./services/dynamodb"

import routes from "./routers/app.router";
require('dotenv').config()


DynamoDbClient.getInstance()

const app: Express = express();


// middleware
app.use(express.json())
app.use('/', routes)

function startServer(callback: () => void) {
    console.log("Initiating server startup...!");
    const PORT = process.env.PORT || "4003";

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}!`);
        callback();
    })
}

startServer(() => {});










