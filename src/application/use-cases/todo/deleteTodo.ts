import { KafkaProducer } from "@infrastructure/kafka/kafkaProducer";
import { container } from "@src/container"; // Assuming you're using a DI container

export const deleteTodo = async (id: string): Promise<void> => {
    // Resolve KafkaProducer from the DI container
    const kafkaProducer = container.get<KafkaProducer>("KafkaProducer");

    // Send a delete message to Kafka
    await kafkaProducer.sendMessage("todo-events", { action: "delete", data: { id } });
};