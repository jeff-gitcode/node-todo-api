import { createTodo } from '@application/use-cases/todo/createTodo';
import { KafkaProducer } from '@infrastructure/kafka/kafkaProducer';
import { container } from '@src/container'; // Import the DI container
import logger from '../../../logger';
import { Kafka } from 'kafkajs';

jest.mock('@infrastructure/kafka/kafkaProducer', () => ({
    KafkaProducer: jest.fn().mockImplementation(() => ({
        sendMessage: jest.fn(),
    })),
}));

jest.mock('../../../logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));

jest.mock('@src/container', () => ({
    container: {
        get: jest.fn(),
    },
}));

describe('createTodo', () => {
    let mockKafkaProducer: KafkaProducer;
    let mockKafka: Kafka;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Kafka instance
        mockKafka = new Kafka({ clientId: 'test-client', brokers: ['localhost:9092'] });

        // Mock KafkaProducer instance
        mockKafkaProducer = new KafkaProducer(mockKafka) as jest.Mocked<KafkaProducer>;

        // Mock the DI container to return the mocked KafkaProducer
        (container.get as jest.Mock).mockImplementation((dependency) => {
            if (dependency === 'KafkaProducer') {
                return mockKafkaProducer;
            }
            throw new Error(`Dependency '${dependency}' not found`);
        });
    });

    it('should create a new todo and send a Kafka message', async () => {
        const title = 'Test Todo';

        // Call the createTodo function
        const result = await createTodo({ title });

        // Verify the returned todo object
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title', title);

        // Verify that sendMessage was called with the correct arguments
        expect(mockKafkaProducer.sendMessage).toHaveBeenCalledWith('todo-events', {
            action: 'create',
            data: result,
        });

        // Verify that logger.info was called
        expect(logger.info).toHaveBeenCalledWith('Creating todo:', result);
    });

    it('should throw an error if title is missing', async () => {
        await expect(createTodo({ title: '' })).rejects.toThrow('Title is required');
    });
});