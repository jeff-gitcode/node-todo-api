import { Kafka } from 'kafkajs';
import { kafkaProducerMiddleware } from './middleware';

const kafka = new Kafka({
    clientId: 'todo-api',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();

export const connectProducer = async () => {
    await producer.connect();
};

// Wrapped sendMessage function with middleware
export const sendMessage = async (topic: string, message: any) => {
    await kafkaProducerMiddleware(topic, message, async (topic: string, message: any) => {
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
    });
};