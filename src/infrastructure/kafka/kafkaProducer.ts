import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'todo-api',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();

export const connectProducer = async () => {
    await producer.connect();
};

export const sendMessage = async (topic: string, message: any) => {
    console.log(`Sending message to topic ${topic}: ${JSON.stringify(message)}`);
    await producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
    });
};