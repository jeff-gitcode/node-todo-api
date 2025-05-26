import { updateTodo } from '@application/use-cases/todo/updateTodo';
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

describe('updateTodo', () => {
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

    it('should update a todo and send a Kafka message', async () => {
        const todoId = '1';
        const updatedTitle = 'Updated Todo';
        const updatedTodo = { id: todoId, title: updatedTitle };

        // Call the updateTodo function
        const result = await updateTodo(todoId, updatedTitle);

        // Verify the returned updated todo object
        expect(result).toEqual(updatedTodo);

        // Verify that sendMessage was called with the correct arguments
        expect(mockKafkaProducer.sendMessage).toHaveBeenCalledTimes(1);
        expect(mockKafkaProducer.sendMessage).toHaveBeenCalledWith('todo-events', {
            action: 'update',
            data: {
                id: todoId,
                title: updatedTitle,
            },
        });
    });

    it('should throw an error if title is missing', async () => {
        const todoId = '1';
        const updatedTitle = '';

        await expect(updateTodo(todoId, updatedTitle)).rejects.toThrow('Title is required');
    });
});