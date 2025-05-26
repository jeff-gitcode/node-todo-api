import { connectProducer, sendMessage } from '@infrastructure/kafka/kafkaProducer';
import { connectConsumer } from '@infrastructure/kafka/kafkaConsumer';
import { connectToDatabase, getMongoClient, stopMemoryServer } from '@infrastructure/database/mongoClient';
import TodoRepository from '@infrastructure/repositories/todoRepository';
import { Todo } from '@domain/entities/todo';
import { ObjectId } from 'mongodb';

describe('Kafka Integration Test', () => {
    let todoRepository: TodoRepository;

    beforeAll(async () => {
        // Connect to the in-memory MongoDB
        await connectToDatabase();
        const client = getMongoClient();
        todoRepository = new TodoRepository(client, 'todo-api');

        // Connect Kafka producer and consumer
        await connectProducer();
        await connectConsumer();
    });

    afterAll(async () => {
        // Stop the in-memory MongoDB server
        await stopMemoryServer();
    });

    it('should process "create" messages and insert a todo into MongoDB', async () => {
        const todoData = new Todo(new ObjectId().toString(), 'Integration Test Todo');
        // Send a "create" message to Kafka
        await sendMessage('todo-events', { action: 'create', data: todoData });

        // Wait for the consumer to process the message
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify the todo was inserted into MongoDB
        const todos = await todoRepository.fetchTodos();
        expect(todos).toHaveLength(1);
        expect(todos[0].title).toBe(todoData.title);
    });

    it('should process "update" messages and update a todo in MongoDB', async () => {
        // Insert a todo directly into MongoDB
        const todo = new Todo(new ObjectId().toString(), 'Old Title');
        const insertedTodo = await todoRepository.addTodo(todo);

        // Send an "update" message to Kafka
        const updatedData = { id: insertedTodo.id, title: 'Updated Title' };
        await sendMessage('todo-events', { action: 'update', data: updatedData });

        // Wait for the consumer to process the message
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify the todo was updated in MongoDB
        const todos = await todoRepository.fetchTodos();
        expect(todos).toHaveLength(1);
        expect(todos[0].title).toBe(updatedData.title);
    });

    it('should process "delete" messages and remove a todo from MongoDB', async () => {
        // Insert a todo directly into MongoDB
        const todo = new Todo(new ObjectId().toString(), 'Todo to Delete');
        const insertedTodo = await todoRepository.addTodo(todo);

        // Send a "delete" message to Kafka
        await sendMessage('todo-events', { action: 'delete', data: { id: insertedTodo.id } });

        // Wait for the consumer to process the message
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify the todo was deleted from MongoDB
        const todos = await todoRepository.fetchTodos();
        expect(todos).toHaveLength(0);
    });
});