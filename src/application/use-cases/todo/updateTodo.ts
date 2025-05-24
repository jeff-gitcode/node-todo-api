import { sendMessage } from "infrastructure/kafka/kafkaProducer";

export const updateTodo = async (id: string, title: string, todoRepository: any): Promise<any> => {
    if (!title) {
        throw new Error('Title is required');
    }

    // Generate the updatedTodo object directly
    const updatedTodo = { id, title };

    await sendMessage('todo-events', { action: 'update', data: updatedTodo });
};