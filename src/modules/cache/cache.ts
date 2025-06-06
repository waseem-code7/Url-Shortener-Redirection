import RedisService from "../../services/redis";

const utils = require("../../common/utils");
const logger = utils.getLogger("cache");

export const setInCache = async function (shortUrlId: string, longUrl: string) {
    try {
        const key = `URL:CACHED:${shortUrlId}`
        const ttl = parseInt(process.env.CACHE_TTL || "86400", 10);
        const redisInstance = await RedisService.getInstance();
        await redisInstance.hset(key, "long_url", longUrl, ttl)
        logger.info(`Set in cache success: ${shortUrlId}`);
    }
    catch (e) {
        logger.error(`Error occurred while setting in cache ${utils.getErrorMessage(e)}`);
    }
}

export const updateInCache = async function (shortUrlId: string, longUrl: string) {
    try {
        await deleteInCache(shortUrlId)
        await setInCache(shortUrlId, longUrl);
        logger.info(`Update in cache success: ${shortUrlId}`);
    }
    catch (e) {
        logger.error(`Error occurred while updating in cache ${utils.getErrorMessage(e)}`);
    }

}

export const deleteInCache = async function (shortUrlId: string) {
    try {
        const key = `URL:CACHED:${shortUrlId}`
        const redisInstance = await RedisService.getInstance();
        await redisInstance.del(key)
        logger.info(`Delete in cache success: ${shortUrlId}`);
    }
    catch (e) {
        logger.error(`Error occurred while deleting from cache ${utils.getErrorMessage(e)}`);
    }
}

export const fetchUrlFromCache = async function (shortUrlId: string): Promise<string> {
    const key = `URL:CACHED:${shortUrlId}`
    const redisInstance = await RedisService.getInstance();
    return redisInstance.hget(key, "long_url");
}