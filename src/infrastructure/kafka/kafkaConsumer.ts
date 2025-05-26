import { Kafka } from 'kafkajs';
import TodoRepository from '@infrastructure/repositories/todoRepository';
import { getMongoClient } from '@infrastructure/database/mongoClient';
import { kafkaConsumerMiddleware } from './middleware';
import { container } from '@src/container';
import { MongoClient } from 'mongodb';

const kafka = new Kafka({
    clientId: 'todo-api',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'todo-group' });

export const connectConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'todo-events', fromBeginning: true });

    // const client = getMongoClient();
    // const todoRepository = new TodoRepository(client, 'todo-api');
    const client = container.get<MongoClient>('MongoClient');
    const todoRepository = container.get<TodoRepository>('TodoRepository');

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value?.toString() || '{}');
            const { action, data } = event;

            // await kafkaConsumerMiddleware(event, async (event: any) => {

            if (action === 'create') {
                await todoRepository.addTodo(data);
            } else if (action === 'update') {
                await todoRepository.updateTodo(data.id, data.title);
            } else if (action === 'delete') {
                await todoRepository.deleteTodo(data.id);
            }
            // });
        }
    });
};