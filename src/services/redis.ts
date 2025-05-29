import {createCluster, RedisClusterType} from 'redis';

const utils = require("../common/utils");
const logger = utils.getLogger();

class RedisService {
    private static instance: RedisService;
    private nodeIps: string[]
    private cluster!: RedisClusterType;

    private constructor() {
        const nodeIps = process.env.REDIS_NODES || "";
        if(nodeIps.length === 0) {
            throw new Error('Redis nodes not found');
        }
        this.nodeIps = nodeIps.split(",")
    }

    private async initialize() {
        const rootNodes = this.nodeIps.map((ip) => {
            return {"url": `redis://${ip}`}
        })
        logger.info(`Initializing redis cluster with ${this.nodeIps} nodes.`)
        this.cluster = createCluster({"rootNodes": rootNodes})
        await this.cluster.connect()
        logger.info('Redis cluster ready');
    }

    public static async getInstance(): Promise<RedisService> {
        if(!RedisService.instance) {
            RedisService.instance = new RedisService();
            await RedisService.instance.initialize();
        }
        return RedisService.instance;
    }

    public async hget(key: string, field: string): Promise<any> {
        try {
            return await this.cluster?.HGET(key, field);
        }
        catch (err) {
            logger.error(`HGET ${key} error: ${utils.getErrorMessage(err)}`);
        }
    }

    public async hset(key: string, field: string, value: any): Promise<any> {
        try {
            return await this.cluster?.HSET(key, field, value);
        }
        catch (err) {
            logger.error(`HSET ${key} error: ${utils.getErrorMessage(err)}`);
        }
    }

    public async hDel(key: string, field: string): Promise<any> {
        try {
            return await this.cluster?.hDel(key, field);
        }
        catch (err) {
            logger.error(`HDel ${key} error: ${utils.getErrorMessage(err)}`);
        }
    }
}

export default RedisService;