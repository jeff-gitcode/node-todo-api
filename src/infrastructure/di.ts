import { MongoClient } from 'mongodb';
import { Kafka } from 'kafkajs';

import { container } from '@src/container';
import { connectToDatabase, getMongoClient } from './database/mongoClient';
import TodoRepository from './repositories/todoRepository';
import { KafkaConsumer } from './kafka/kafkaConsumer';
import { KafkaProducer } from './kafka/kafkaProducer';

export async function registerInfrastructureService(): Promise<typeof container> {
  // Connect to MongoDB
  await connectToDatabase();

  const client = getMongoClient();
  const todoRepository = new TodoRepository(client, 'todo-api');

  container.register('TodoRepository', todoRepository);
  container.register('MongoClient', client);

  // Register Kafka consumer and producer
  const kafka = new Kafka({
    clientId: 'todo-api',
    brokers: ['localhost:9092'],
  });

  const kafkaProducer = new KafkaProducer(kafka);
  const kafkaConsumer = new KafkaConsumer(kafka, todoRepository);

  container.register('KafkaProducer', kafkaProducer);
  container.register('KafkaConsumer', kafkaConsumer);

  return container;
}