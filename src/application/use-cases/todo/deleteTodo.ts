import { sendMessage } from "@infrastructure/kafka/kafkaProducer";

export const deleteTodo = async (id: string): Promise<void> => {
    await sendMessage('todo-events', { action: 'delete', data: { id } });
};