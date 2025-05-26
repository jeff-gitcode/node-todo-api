import { connectConsumer } from '@infrastructure/kafka/kafkaConsumer';
import { getMongoClient } from '@infrastructure/database/mongoClient';
import { ObjectId } from 'mongodb';
const { consumer } = require('kafkajs').Kafka();

// Mock repositories
const mockAddTodo = jest.fn();
const mockUpdateTodo = jest.fn();
const mockDeleteTodo = jest.fn();

// Mock TodoRepository before importing modules
jest.mock('@infrastructure/repositories/todoRepository', () => {
    return jest.fn().mockImplementation(() => ({
        addTodo: mockAddTodo,
        updateTodo: mockUpdateTodo,
        deleteTodo: mockDeleteTodo
    }));
});

jest.mock('@infrastructure/database/mongoClient', () => ({
    getMongoClient: jest.fn()
}));

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
    beforeEach(() => {
        // Clear mocks before each test
        jest.clearAllMocks();
        messageHandler = null;

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
        expect(mockAddTodo).toHaveBeenCalledTimes(1);
        expect(mockAddTodo).toHaveBeenCalledWith(todo);
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
        expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
        expect(mockUpdateTodo).toHaveBeenCalledWith(updateData.id, updateData.title);
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
        expect(mockDeleteTodo).toHaveBeenCalledTimes(1);
        expect(mockDeleteTodo).toHaveBeenCalledWith(deleteData.id);
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