import {Request, Response, NextFunction} from "express";
import DynamoDbClient from "./dynamodb";
const utils = require("../common/utils");
const logger = utils.getLogger();

const loadUrlDocument = async (req: Request, res: Response, next: NextFunction) => {
    const shortUrlId = req.params.shortUrlId;
    const dbInstance = DynamoDbClient.getInstance()
    const item = await dbInstance.getItemByPartitionKey("Urls", "short_url_id", shortUrlId);
    if (item === null || item.length === 0) {
        logger.error("Document not found for shortUrlId", shortUrlId);
        return res.status(404).json({ error: "Not Found" });
    }
    res.locals["item"] = item[0];
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
}

