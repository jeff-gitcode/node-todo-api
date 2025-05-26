import { KafkaProducer } from '@infrastructure/kafka/kafkaProducer';
import { container } from '@src/container'; // Assuming you're using a DI container
import { ObjectId } from 'mongodb';

export async function createTodo(data: { title: string }) {
    const kafkaProducer = container.get<KafkaProducer>('KafkaProducer'); // Resolve KafkaProducer from DI container

    const todo = {
        id: new ObjectId().toString(),
        title: data.title,
    };

    // Save the todo to the database (not shown here)

    // Send a message to Kafka
    await kafkaProducer.sendMessage('todo-events', { action: 'create', data: todo });

    return todo;
}