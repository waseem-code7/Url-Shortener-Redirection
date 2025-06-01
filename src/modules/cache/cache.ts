import RedisService from "../../services/redis";
const utils = require("../../common/utils");
const logger = utils.getLogger("cache");

export const setInCache = async function (shortUrlId: string, longUrl: string) {
    try {
        const key = `URL:CACHED:${shortUrlId}`
        const redisInstance = await RedisService.getInstance();
        await redisInstance.hset(key, "long_url", longUrl, 86400)
        logger.info(`Set in cache success: ${shortUrlId}`);
    }
    catch (e) {
        logger.error(`Error occurred while setting in cache ${utils.getErrorMessage(e)}`);
    }
}

export const updateInCache = async function (shortUrlId: string, longUrl: string) {
    try {
        const key = `URL:CACHED:${shortUrlId}`
        const redisInstance = await RedisService.getInstance();
        await redisInstance.hset(key, "long_url", longUrl)
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