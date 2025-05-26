import request from 'supertest';
import { app } from '@src/server'; // Adjust the import based on your server file structure
import { connectToDatabase, stopMemoryServer } from '@infrastructure/database/mongoClient';
import TodoRepository from '@infrastructure/repositories/todoRepository';
import { ObjectId } from 'mongodb';
import { container } from '@src/container';

jest.mock('kafkajs', () => {
    const mockProducer = {
        connect: jest.fn().mockResolvedValue(undefined),
        send: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
    };

    const mockConsumer = {
        connect: jest.fn().mockResolvedValue(undefined),
        subscribe: jest.fn().mockResolvedValue(undefined),
        run: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
    };

    return {
        Kafka: jest.fn().mockImplementation(() => ({
            producer: jest.fn(() => mockProducer),
            consumer: jest.fn(() => mockConsumer),
        })),
    };
});

describe('Todo API Integration Tests', () => {
    let todoRepository: TodoRepository;

    beforeAll(async () => {
        const dbConnection = await connectToDatabase();
        // Resolve the real TodoRepository from the DI container
        todoRepository = container.get<TodoRepository>('TodoRepository');
    });

    afterAll(async () => {
        await stopMemoryServer(); // Stops the in-memory MongoDB server
    });

    beforeEach(async () => {
        // Clear the database before each test
        const db = (await connectToDatabase()).db('todo-api');
        await db.collection('todos').deleteMany({});
    });

    it('should create a new todo', async () => {
        const response = await request(app)
            .post('/todos')
            .send({ title: 'Test Todo' })
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Test Todo');
    });

    it('should fetch all todos', async () => {
        // Insert todos directly into the database
        await todoRepository.addTodo({ id: new ObjectId().toString(), title: 'First Todo' });
        await todoRepository.addTodo({ id: new ObjectId().toString(), title: 'Second Todo' });

        // Verify the todos were inserted
        const todos = await todoRepository.fetchTodos();
        console.log('Seeded todos:', todos); // Debugging log

        // Fetch todos
        const response = await request(app).get('/todos').expect(200);

        // Verify the response
        console.log('Fetched todos:', response.body); // Debugging log
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toHaveProperty('_id');
        expect(response.body[0].title).toBe('First Todo');
        expect(response.body[1].title).toBe('Second Todo');
    });

    it('should update a todo', async () => {
        // Create a todo
        const createResponse = await request(app)
            .post('/todos')
            .send({ title: 'Old Title' })
            .expect(201);

        const todoId = createResponse.body.id;

        // Update the todo
        const updateResponse = await request(app)
            .put(`/todos/${todoId}`)
            .send({ title: 'Updated Title' })
            .expect(200);

        expect(updateResponse.body).toHaveProperty('id', todoId);
        expect(updateResponse.body.title).toBe('Updated Title');
    });

    it('should delete a todo', async () => {
        // Create a todo
        const createResponse = await request(app)
            .post('/todos')
            .send({ title: 'Test Todo' })
            .expect(201);

        const todoId = createResponse.body.id;

        // Delete the todo
        await request(app).delete(`/todos/${todoId}`).expect(204);

        // Verify the todo is deleted
        const fetchResponse = await request(app).get('/todos').expect(200);
        expect(fetchResponse.body).toHaveLength(0);
    });

    it('should return 204 for deleting a non-existent todo', async () => {
        await request(app)
            .delete('/todos/64f1b2c5e4b0a3d2f8c9e123') // Random ObjectId
            .expect(204); // Deleting a non-existent todo should still return 204
    });
});