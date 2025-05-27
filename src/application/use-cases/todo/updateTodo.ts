import { KafkaProducer } from "@infrastructure/kafka/kafkaProducer";
import { Todo } from "@domain/entities/todo";
import { container } from "@src/container"; // Assuming you're using a DI container

export const updateTodo = async (id: string, title: string): Promise<Todo> => {
    if (!title) {
        throw new Error('Title is required');
    }

    // Generate the updatedTodo object directly
    const updatedTodo = { id, title };

    // Resolve KafkaProducer from the DI container
    const kafkaProducer = container.get<KafkaProducer>("KafkaProducer");

    // Send an update message to Kafka
    await kafkaProducer.sendMessage("todo-events", { action: "update", data: updatedTodo });

    return updatedTodo;
};