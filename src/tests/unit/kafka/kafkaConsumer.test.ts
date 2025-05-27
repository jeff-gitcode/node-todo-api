import TodoRepository from '@infrastructure/repositories/todoRepository';
import { KafkaConsumer } from '@infrastructure/kafka/kafkaConsumer';
import { Kafka } from 'kafkajs';

jest.mock('@src/container', () => ({
    container: {
        get: jest.fn(),
    },
}));

jest.mock('@infrastructure/database/mongoClient', () => ({
    getMongoClient: jest.fn(),
}));

jest.mock('kafkajs', () => ({
    Kafka: jest.fn().mockImplementation(() => ({
        consumer: jest.fn().mockImplementation(() => ({
            connect: jest.fn(),
            subscribe: jest.fn(),
            run: jest.fn(),
            disconnect: jest.fn(),
        })),
    })),
}));

jest.mock('@infrastructure/repositories/todoRepository', () => {
    return jest.fn().mockImplementation(() => ({
        addTodo: jest.fn(),
        updateTodo: jest.fn(),
        deleteTodo: jest.fn()
    }));
});

describe('KafkaConsumer', () => {
    let kafkaConsumer: KafkaConsumer;
    let mockTodoRepository: jest.Mocked<TodoRepository>;
    let mockKafka: Kafka;
    let mockConsumer: any; // This will hold the mocked consumer instance

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock TodoRepository
        mockTodoRepository = {
            addTodo: jest.fn(),
            updateTodo: jest.fn(),
            deleteTodo: jest.fn(),
        } as unknown as jest.Mocked<TodoRepository>;

        // Mock Kafka consumer with connect method
        mockConsumer = {
            connect: jest.fn(),
            subscribe: jest.fn(),
            run: jest.fn(),
            disconnect: jest.fn(),
        };

        // Mock Kafka instance
        mockKafka = {
            consumer: jest.fn().mockReturnValue(mockConsumer),
        } as unknown as Kafka;

        // Create an instance of KafkaConsumer with mocked dependencies
        kafkaConsumer = new KafkaConsumer(mockKafka, mockTodoRepository);
    });

    it('should connect to Kafka', async () => {
        await kafkaConsumer.connect();

        // Verify that the connect method was called
        expect(mockConsumer.connect).toHaveBeenCalledTimes(1);
    });
    

    it('should subscribe to a topic', async () => {
        const topic = 'todo-events';

        await kafkaConsumer.subscribe(topic);

        // Verify that the subscribe method was called with the correct topic
        expect(mockConsumer.subscribe).toHaveBeenCalledWith({
            topic,
            fromBeginning: true,
        });
    });

    it('should process "create" messages and call addTodo', async () => {
        const messageHandler = jest.fn();
        mockConsumer.run = jest.fn(async (config) => {
            if (config && config.eachMessage) {
                messageHandler.mockImplementation(config.eachMessage);
            }
        });

        await kafkaConsumer.run();

        // Simulate a Kafka message with "create" action
        const todo = { id: '1', title: 'Test Todo' };
        await messageHandler({
            topic: 'todo-events',
            partition: 0,
            message: {
                value: JSON.stringify({ action: 'create', data: todo }),
            },
        });

        // Verify that addTodo was called with the correct arguments
        expect(mockTodoRepository.addTodo).toHaveBeenCalledTimes(1);
        expect(mockTodoRepository.addTodo).toHaveBeenCalledWith(todo);
    });

    it('should process "update" messages and call updateTodo', async () => {
        const messageHandler = jest.fn();
        mockConsumer.run = jest.fn(async (config) => {
            if (config && config.eachMessage) {
                messageHandler.mockImplementation(config.eachMessage);
            }
        });

        await kafkaConsumer.run();

        // Simulate a Kafka message with "update" action
        const updateData = { id: '1', title: 'Updated Todo' };
        await messageHandler({
            topic: 'todo-events',
            partition: 0,
            message: {
                value: JSON.stringify({ action: 'update', data: updateData }),
            },
        });

        // Verify that updateTodo was called with the correct arguments
        expect(mockTodoRepository.updateTodo).toHaveBeenCalledTimes(1);
        expect(mockTodoRepository.updateTodo).toHaveBeenCalledWith(updateData.id, updateData.title);
    });

    it('should process "delete" messages and call deleteTodo', async () => {
        const messageHandler = jest.fn();
        mockConsumer.run = jest.fn(async (config) => {
            if (config && config.eachMessage) {
                messageHandler.mockImplementation(config.eachMessage);
            }
        });

        await kafkaConsumer.run();

        // Simulate a Kafka message with "delete" action
        const deleteData = { id: '1' };
        await messageHandler({
            topic: 'todo-events',
            partition: 0,
            message: {
                value: JSON.stringify({ action: 'delete', data: deleteData }),
            },
        });

        // Verify that deleteTodo was called with the correct arguments
        expect(mockTodoRepository.deleteTodo).toHaveBeenCalledTimes(1);
        expect(mockTodoRepository.deleteTodo).toHaveBeenCalledWith(deleteData.id);
    });

    it('should handle errors in message processing gracefully', async () => {
        const messageHandler = jest.fn();
        mockConsumer.run = jest.fn(async (config) => {
            if (config && config.eachMessage) {
                messageHandler.mockImplementation(config.eachMessage);
            }
        });

        await kafkaConsumer.run();

        // Simulate a malformed Kafka message
        await messageHandler({
            topic: 'todo-events',
            partition: 0,
            message: {
                value: 'invalid-json',
            },
        });

        // Verify that no repository methods were called
        expect(mockTodoRepository.addTodo).not.toHaveBeenCalled();
        expect(mockTodoRepository.updateTodo).not.toHaveBeenCalled();
        expect(mockTodoRepository.deleteTodo).not.toHaveBeenCalled();
    });
});