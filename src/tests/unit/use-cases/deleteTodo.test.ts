import { deleteTodo } from '@application/use-cases/todo/deleteTodo';
import { KafkaProducer } from '@infrastructure/kafka/kafkaProducer';
import { container } from '@src/container'; // Import the DI container
import { Kafka } from 'kafkajs';

jest.mock('@infrastructure/kafka/kafkaProducer', () => ({
    KafkaProducer: jest.fn().mockImplementation(() => ({
        sendMessage: jest.fn(),
    })),
}));

jest.mock('@src/container', () => ({
    container: {
        get: jest.fn(),
    },
}));

describe('deleteTodo', () => {
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

    it('should send a Kafka message with the correct action and data', async () => {
        const todoId = '123';

        // Call the deleteTodo function
        await deleteTodo(todoId);

        // Verify that sendMessage was called with the correct arguments
        expect(mockKafkaProducer.sendMessage).toHaveBeenCalledTimes(1);
        expect(mockKafkaProducer.sendMessage).toHaveBeenCalledWith('todo-events', {
            action: 'delete',
            data: { id: todoId },
        });
    });
});