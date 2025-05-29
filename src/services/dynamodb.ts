import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, GetCommand} from "@aws-sdk/lib-dynamodb";
import {NodeHttpHandler} from "@smithy/node-http-handler";
import https from "https";
const utils = require("../common/utils");
const logger = utils.getLogger();
const maxSockets = parseInt(process.env.MAX_DYNAMO_DB_CONNECTIONS || "50", 10)


class DynamoDbClient {
    private static instance: DynamoDbClient;

    private dynamodbClient: DynamoDBClient
    public docClient;


    private constructor(private maxSockets: number,
                private keepAlive: boolean,
                private keepAliveMsecs: number) {

        this.maxSockets = maxSockets;
        this.keepAlive = keepAlive;
        this.keepAliveMsecs = keepAliveMsecs;
        this.dynamodbClient = this.dynamoDBInit()
        this.docClient = DynamoDBDocumentClient.from(this.dynamodbClient);
    }

    private dynamoDBInit(): DynamoDBClient {

        const agent = new https.Agent({
            maxSockets: this.maxSockets,
            keepAlive: this.keepAlive,
            keepAliveMsecs: this.keepAliveMsecs,
        });

        this.dynamodbClient = new DynamoDBClient({
            requestHandler: new NodeHttpHandler({
                requestTimeout: 3_000,
                httpsAgent: agent
            })
        });

        logger.info("Dynamo DB connection is initiated...");
        return this.dynamodbClient;
    }

    public static getInstance(): DynamoDbClient {
        if(this.instance) {
            return this.instance;
        }
        this.instance = new DynamoDbClient(maxSockets, true, 3000);
        return this.instance;
    }

    public async getItemByPartitionKey(tableName: string, partitionKey: string,  partitionValue: string): Promise<Record<string, any> | null> {
        const command = new GetCommand({
            TableName: tableName,
            Key: {
                [partitionKey]: partitionValue,
            }
        });
        const response = await this.docClient.send(command);
        if (response && response["$metadata"].httpStatusCode === 200 && response["Item"]) {
            return response["Item"]
        }
        return null;
    }
}

export default DynamoDbClient;