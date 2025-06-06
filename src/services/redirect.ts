import {Request, Response, NextFunction} from "express";
import {fetchUrlFromCache, setInCache} from "../modules/cache/cache";
import DynamoDbClient from "./dynamodb";
const utils = require("../common/utils");
const logger = utils.getLogger();

const cacheLookUp = async (req: Request, res: Response, next: NextFunction) => {
    const shortUrlId = req.params.shortUrlId;
    const longUrl = await fetchUrlFromCache(shortUrlId);
    if (longUrl) {
        logger.info(`Cache HIT for shortUrlId :: ${shortUrlId}`);
        return res.redirect(longUrl);
    }
    logger.info("Cache MISS for shortUrlId :: ${shortUrlId}")
    return next();
}

const loadUrlDocument = async (req: Request, res: Response, next: NextFunction) => {
    const shortUrlId = req.params.shortUrlId;
    const dbInstance = DynamoDbClient.getInstance()
    const item = await dbInstance.getItemByPartitionKey(process.env.DYNAMO_DB_TABLE_NAME || "", "short_url_id", shortUrlId);
    if (item === null) {
        logger.error("Document not found for shortUrlId", shortUrlId);
        return res.status(404).json({ error: "Not Found" });
    }
    const longUrl = item["long_url"];
    await setInCache(shortUrlId, longUrl);
    res.locals["item"] = item;
    next();
}

const redirect = async (req: Request, res: Response, next: NextFunction) => {
    const item = res.locals["item"];
    const longUrl = item["long_url"]
    return res.redirect(longUrl);
}

module.exports = {
    loadUrlDocument: loadUrlDocument,
    redirect:  redirect,
    cacheLookUp: cacheLookUp
}

