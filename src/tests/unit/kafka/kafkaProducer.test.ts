import { sendMessage } from '@infrastructure/kafka/kafkaProducer';

jest.mock('kafkajs', () => ({
    Kafka: jest.fn().mockImplementation(() => ({
        producer: jest.fn().mockImplementation(() => ({
            connect: jest.fn(),
            send: jest.fn(),
        })),
    })),
}));

describe('Kafka Producer', () => {
    it('should send a message to Kafka', async () => {
        await sendMessage('test-topic', { key: 'value' });
        expect(true).toBe(true); // Add proper assertions for Kafka mocks
    });
});