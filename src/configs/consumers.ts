import {RegisterKafkaConsumer} from "../interfaces/kafka";
import { handler } from "../modules/consumers/update.delete.consumer"

const consumers: RegisterKafkaConsumer = {
    "url_update_delete": {
        consumerGroupName: "url_update_delete",
        topic: "url_shortener",
        callback: handler,
        options: {
            fromBeginning: true,
            autoCommit: false,
            partitionsConsumedConcurrently: 2
        }
    }
}

export default consumers;