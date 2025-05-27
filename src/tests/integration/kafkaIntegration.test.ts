import { container } from '@src/container';
import { KafkaProducer } from '@infrastructure/kafka/kafkaProducer';
import { KafkaConsumer } from '@infrastructure/kafka/kafkaConsumer';
import TodoRepository from '@infrastructure/repositories/todoRepository';
import { Todo } from '@domain/entities/todo';
import { ObjectId } from 'mongodb';
import { registerInfrastructureService } from '@src/infrastructure/di';

// Mock the Kafka module and related dependencies
jest.mock('kafkajs', () => {
    // Create mock implementations for producer and consumer
    const mockProducer = {
        connect: jest.fn().mockResolvedValue(undefined),
        send: jest.fn().mockImplementation(async ({ topic, messages }) => {
            // When a message is sent to the producer, 
            // directly invoke the message handler to simulate Kafka behavior
            if (mockMessageHandler && topic === 'todo-events') {
                for (const message of messages) {
                    await mockMessageHandler({
                        topic,
                        partition: 0,
                        message: { value: message.value },
                    });
                }
            }
            return { success: true };
        }),
        disconnect: jest.fn().mockResolvedValue(undefined),
    };

    const mockConsumer = {
        connect: jest.fn().mockResolvedValue(undefined),
        subscribe: jest.fn().mockResolvedValue(undefined),
        run: jest.fn().mockImplementation(async ({ eachMessage }) => {
            // Store the message handler to be called when producer sends a message
            mockMessageHandler = eachMessage;
        }),
        disconnect: jest.fn().mockResolvedValue(undefined),
    };

    return {
        Kafka: jest.fn().mockImplementation(() => ({
            producer: jest.fn(() => mockProducer),
            consumer: jest.fn(() => mockConsumer),
        })),
    };
});

// Global variable to store the message handler
let mockMessageHandler: any = null;

describe('Kafka Integration Test', () => {
    let kafkaProducer: KafkaProducer;
    let kafkaConsumer: KafkaConsumer;
    let todoRepository: TodoRepository;

    beforeAll(async () => {
        // Initialize the DI container
        const container = await registerInfrastructureService();

        // Resolve dependencies from the DI container
        kafkaProducer = container.get<KafkaProducer>('KafkaProducer');
        kafkaConsumer = container.get<KafkaConsumer>('KafkaConsumer');
        todoRepository = container.get<TodoRepository>('TodoRepository');

        // Connect Kafka producer and consumer
        await kafkaProducer.connect();
        await kafkaConsumer.connect();
        await kafkaConsumer.subscribe('todo-events');
        await kafkaConsumer.run();
    });

    afterAll(async () => {
        // Disconnect Kafka producer and consumer
        await kafkaProducer.disconnect();
        await kafkaConsumer.disconnect();
    });

    afterEach(async () => {
        // clear the todos collection after each test
        await todoRepository.clearTodos();
    });

    it('should process "create" messages and insert a todo into MongoDB', async () => {
        const todoData = new Todo(new ObjectId().toString(), 'Integration Test Todo');
        // Send a "create" message to Kafka
        await kafkaProducer.sendMessage('todo-events', { action: 'create', data: todoData });

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
        await todoRepository.addTodo(todo);

        // Send an "update" message to Kafka
        const updatedData = { id: todo.id, title: 'Updated Title' };
        await kafkaProducer.sendMessage('todo-events', { action: 'update', data: updatedData });

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
        await todoRepository.addTodo(todo);

        // Send a "delete" message to Kafka
        await kafkaProducer.sendMessage('todo-events', { action: 'delete', data: { id: todo.id } });

        // Wait for the consumer to process the message
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify the todo was deleted from MongoDB
        const todos = await todoRepository.fetchTodos();
        expect(todos).toHaveLength(0);
    });
});