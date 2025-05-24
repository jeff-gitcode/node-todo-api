import { sendMessage } from "infrastructure/kafka/kafkaProducer";

export const deleteTodo = async (id: string, todoRepository: any): Promise<void> => {
    await sendMessage('todo-events', { action: 'delete', data: { id } });
};