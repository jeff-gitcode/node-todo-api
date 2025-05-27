import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import TodoRepository from '@infrastructure/repositories/todoRepository';

export class KafkaConsumer {
    private readonly consumer: Consumer;
    private readonly todoRepository: TodoRepository;

    constructor(kafka: Kafka, todoRepository: TodoRepository) {
        this.consumer = kafka.consumer({ groupId: 'todo-group' });
        this.todoRepository = todoRepository;
    }

    async connect(): Promise<void> {
        await this.consumer.connect();
    }

    async subscribe(topic: string): Promise<void> {
        await this.consumer.subscribe({ topic, fromBeginning: true });
    }

    async run(): Promise<void> {
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
                try {
                    // Parse the message value
                    const event = JSON.parse(message.value?.toString() || '{}');
                    const { action, data } = event;

                    // Handle different actions
                    if (action === 'create') {
                        await this.todoRepository.addTodo(data);
                    } else if (action === 'update') {
                        await this.todoRepository.updateTodo(data.id, data.title);
                    } else if (action === 'delete') {
                        await this.todoRepository.deleteTodo(data.id);
                    }
                } catch (error: unknown) {
                    // Log the error but don't crash the consumer
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(`Error processing message: ${errorMessage}`, {
                        topic,
                        partition,
                        message: message.value?.toString(),
                    });
                }
            },
        });
    }

    async disconnect(): Promise<void> {
        await this.consumer.disconnect();
    }
}