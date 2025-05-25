import logger from "../../logger";

export const kafkaProducerMiddleware = async (topic: string, message: any, next: Function) => {
    logger.info(`Middleware: Preparing to send message to topic "${topic}": ${JSON.stringify(message)}`);
    try {
        await next(topic, message);
        logger.info(`Middleware: Message successfully sent to topic "${topic}".`);
    } catch (error) {
        logger.error(`Middleware: Failed to send message to topic "${topic}": ${error}`);
        throw error;
    }
};

// Middleware-like function for logging and processing
export const kafkaConsumerMiddleware = async (event: any, next: Function) => {
    logger.info(`Middleware: Received message: ${JSON.stringify(event)}`);
    try {
        await next(event);
        logger.info(`Middleware: Successfully processed message: ${JSON.stringify(event)}`);
    } catch (error) {
        logger.error(`Middleware: Failed to process message: ${JSON.stringify(event)}. Error: ${error}`);
        throw error;
    }
};
