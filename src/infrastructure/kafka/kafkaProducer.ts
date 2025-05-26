import { Kafka, Producer } from 'kafkajs';

export class KafkaProducer {
    private producer: Producer;

    constructor(kafka: Kafka) {
        this.producer = kafka.producer();
    }

    async connect(): Promise<void> {
        await this.producer.connect();
    }

    async sendMessage(topic: string, message: any): Promise<void> {
        await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
    }

    async disconnect(): Promise<void> {
        await this.producer.disconnect();
    }
}