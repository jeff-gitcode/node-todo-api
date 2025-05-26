import { container } from '@src/container'; // Import your DI container
import { MongoClient, ObjectId } from 'mongodb';
import { connectConsumer } from '@infrastructure/kafka/kafkaConsumer';
import { getMongoClient } from '@infrastructure/database/mongoClient';
import TodoRepository from '@infrastructure/repositories/todoRepository';
const { consumer } = require('kafkajs').Kafka();

jest.mock('@src/container', () => ({
    container: {
        get: jest.fn(),
    },
}));

jest.mock('@infrastructure/database/mongoClient', () => ({
    getMongoClient: jest.fn(),
}));

// Mock repositories
const mockAddTodo = jest.fn();
const mockUpdateTodo = jest.fn();
const mockDeleteTodo = jest.fn();

jest.mock('@infrastructure/repositories/todoRepository', () => {
    return jest.fn().mockImplementation(() => ({
        addTodo: mockAddTodo,
        updateTodo: mockUpdateTodo,
        deleteTodo: mockDeleteTodo
    }));
});

// Store message handlers for different test scenarios
let messageHandler: any = null;

// Mock kafkajs with a function to capture the eachMessage handler
jest.mock('kafkajs', () => {
    const mockConnect = jest.fn();
    const mockSubscribe = jest.fn();
    const mockRun = jest.fn().mockImplementation(({ eachMessage }) => {
        messageHandler = eachMessage; // Capture the message handler for testing
        return Promise.resolve();
    });

    return {
        Kafka: jest.fn().mockImplementation(() => ({
            consumer: jest.fn().mockImplementation(() => ({
                connect: mockConnect,
                subscribe: mockSubscribe,
                run: mockRun,
            })),
        })),
    };
});

describe('Kafka Consumer Tests', () => {
    let mockMongoClient: MongoClient;
    let mockTodoRepository: TodoRepository;

    beforeEach(() => {
        // Clear mocks before each test
        jest.clearAllMocks();
        messageHandler = null;

        // Mock MongoClient and TodoRepository
        mockMongoClient = {} as MongoClient;
        mockTodoRepository = {
            addTodo: jest.fn(),
            updateTodo: jest.fn(),
            deleteTodo: jest.fn(),
            fetchTodos: jest.fn(),
        } as unknown as TodoRepository;

        // Mock DI container to return mocked dependencies
        (container.get as jest.Mock).mockImplementation((dependency) => {
            if (dependency === 'MongoClient') return mockMongoClient;
            if (dependency === 'TodoRepository') return mockTodoRepository;
            throw new Error(`Dependency '${dependency}' not found`);
        });

        // Set up default mock client
        const mockClient = {};
        (getMongoClient as jest.Mock).mockReturnValue(mockClient);
    });

    it('should connect to Kafka and subscribe to todo-events topic', async () => {
        await connectConsumer();

        // Verify the consumer was connected and subscribed
        expect(consumer().connect).toHaveBeenCalled();
        expect(consumer().subscribe).toHaveBeenCalledWith({
            topic: 'todo-events',
            fromBeginning: true
        });
    });

    it('should process "create" action and call addTodo', async () => {
        // Connect consumer to get message handler
        await connectConsumer();
        expect(messageHandler).toBeDefined();

        // Create a todo sample
        const todo = { id: new ObjectId().toString(), title: 'Test Todo' };

        // Simulate a Kafka message with "create" action
        await messageHandler({
            topic: 'todo-events',
            partition: 0,
            message: {
                value: JSON.stringify({ action: 'create', data: todo })
            }
        });

        // Verify addTodo was called with the todo
        expect(mockTodoRepository.addTodo).toHaveBeenCalledTimes(1);
        expect(mockTodoRepository.addTodo).toHaveBeenCalledWith(todo);
    });

    it('should process "update" action and call updateTodo', async () => {
        // Connect consumer to get message handler
        await connectConsumer();
        expect(messageHandler).toBeDefined();

        // Create update data
        const updateData = { id: new ObjectId().toString(), title: 'Updated Todo' };

        // Simulate a Kafka message with "update" action
        await messageHandler({
            topic: 'todo-events',
            partition: 0,
            message: {
                value: JSON.stringify({ action: 'update', data: updateData })
            }
        });

        // Verify updateTodo was called with the id and title
        expect(mockTodoRepository.updateTodo).toHaveBeenCalledTimes(1);
        expect(mockTodoRepository.updateTodo).toHaveBeenCalledWith(updateData.id, updateData.title);
    });

    it('should process "delete" action and call deleteTodo', async () => {
        // Connect consumer to get message handler
        await connectConsumer();
        expect(messageHandler).toBeDefined();

        // Create delete data with just an ID
        const deleteData = { id: new ObjectId().toString() };

        // Simulate a Kafka message with "delete" action
        await messageHandler({
            topic: 'todo-events',
            partition: 0,
            message: {
                value: JSON.stringify({ action: 'delete', data: deleteData })
            }
        });

        // Verify deleteTodo was called with the id
        expect(mockTodoRepository.deleteTodo).toHaveBeenCalledTimes(1);
        expect(mockTodoRepository.deleteTodo).toHaveBeenCalledWith(deleteData.id);
    });

    it('should handle malformed message without throwing error', async () => {
        // Connect consumer to get message handler
        await connectConsumer();
        expect(messageHandler).toBeDefined();

        // Simulate a malformed Kafka message (missing action)
        await messageHandler({
            topic: 'todo-events',
            partition: 0,
            message: {
                value: JSON.stringify({ data: { title: 'Test Todo' } })
            }
        });

        // Verify no repository methods were called
        expect(mockAddTodo).not.toHaveBeenCalled();
        expect(mockUpdateTodo).not.toHaveBeenCalled();
        expect(mockDeleteTodo).not.toHaveBeenCalled();
    });

    it('should handle unknown action without throwing error', async () => {
        // Connect consumer to get message handler
        await connectConsumer();
        expect(messageHandler).toBeDefined();

        // Simulate a Kafka message with unknown action
        await messageHandler({
            topic: 'todo-events',
            partition: 0,
            message: {
                value: JSON.stringify({ action: 'unknown', data: { id: '123' } })
            }
        });

        // Verify no repository methods were called
        expect(mockAddTodo).not.toHaveBeenCalled();
        expect(mockUpdateTodo).not.toHaveBeenCalled();
        expect(mockDeleteTodo).not.toHaveBeenCalled();
    });
});