import { MongoClient } from 'mongodb';
import { container } from '@src/container';
import { connectToDatabase, getMongoClient } from './database/mongoClient';
import TodoRepository from './repositories/todoRepository';

export async function registerInfrastructureService() {
  // Connect to MongoDB
  await connectToDatabase();

  const client = getMongoClient();
  const todoRepository = new TodoRepository(client, 'todo-api');

  container.register('TodoRepository', todoRepository);
  container.register('MongoClient', client);
}