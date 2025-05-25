import { sendMessage } from "@infrastructure/kafka/kafkaProducer";
import { Todo } from "@domain/entities/todo";

export const updateTodo = async (id: string, title: string): Promise<Todo> => {
    if (!title) {
        throw new Error('Title is required');
    }

    // Generate the updatedTodo object directly
    const updatedTodo = { id, title };

    await sendMessage('todo-events', { action: 'update', data: updatedTodo });

    return updatedTodo;
};