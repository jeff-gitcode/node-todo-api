import { KafkaProducer } from '@infrastructure/kafka/kafkaProducer';
import { Kafka } from 'kafkajs';

jest.mock('kafkajs', () => ({
    Kafka: jest.fn().mockImplementation(() => ({
        producer: jest.fn().mockImplementation(() => ({
            connect: jest.fn(),
            send: jest.fn(),
            disconnect: jest.fn(),
        })),
    })),
}));

describe('Kafka Producer', () => {
    let kafkaProducer: KafkaProducer;

    beforeEach(() => {
        const kafka = new Kafka({ clientId: 'test-client', brokers: ['localhost:9092'] });
        kafkaProducer = new KafkaProducer(kafka);
    });

    it('should connect to Kafka', async () => {
        await kafkaProducer.connect();
        expect(kafkaProducer['producer'].connect).toHaveBeenCalled();
    });

    it('should send a message to Kafka', async () => {
        await kafkaProducer.sendMessage('test-topic', { key: 'value' });
        expect(kafkaProducer['producer'].send).toHaveBeenCalledWith({
            topic: 'test-topic',
            messages: [{ value: JSON.stringify({ key: 'value' }) }],
        });
    });

    it('should disconnect from Kafka', async () => {
        await kafkaProducer.disconnect();
        expect(kafkaProducer['producer'].disconnect).toHaveBeenCalled();
    });
});