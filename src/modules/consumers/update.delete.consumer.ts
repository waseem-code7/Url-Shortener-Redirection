import {UpdateKafkaMessage, KafkaMessage} from "../../interfaces/kafka";
import {Consumer, EachMessagePayload} from "kafkajs";
import { strictJSONParse } from "../../common/generics";
import {updateInCache, deleteInCache} from "../cache/cache"
const utils = require("../../common/utils");
const logger = utils.getLogger();

const updateUrlInCache = async function(value: string) {
    const message = strictJSONParse<UpdateKafkaMessage>(value);
    if (message) {
        await updateInCache(message.short_url_id, message.long_url)
    }
}

const deleteUrlInCache = async function(value: string) {
    const message = strictJSONParse<KafkaMessage>(value);
    if (message) {
        await deleteInCache(message.short_url_id)
    }
}

export const handler = async function(payload: EachMessagePayload, consumer: Consumer): Promise<void > {
    let key = payload.message.key?.toString("utf-8") || ""
    let value = payload.message.value?.toString("utf-8") || ""

    const topic = payload.topic;
    const partition = payload.partition;

    if(key === "UPDATE_URL") {
        await updateUrlInCache(value);
    } else if (key === "DELETE_URL") {
        await deleteUrlInCache(value);
    } else {
        logger.info("Invalid Key received hence moving offset");
    }

    const offset = payload.message.offset;
    await consumer.commitOffsets([
        { topic, partition, offset: (Number(offset) + 1).toString() }
    ]);

    logger.info("Updated offset", offset);
}