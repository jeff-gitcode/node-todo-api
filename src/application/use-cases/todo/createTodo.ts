import { Todo } from '@domain/entities/todo';
import { sendMessage } from '@infrastructure/kafka/kafkaProducer';
import logger from '../../../logger';
import { ObjectId } from 'mongodb';

export const createTodo = async (todoData: { title: string }): Promise<Todo> => {
    if (!todoData.title) {
        throw new Error('Title is required');
    }

    // Generate a unique id for the todo
    const id = new ObjectId().toString();

    // Create the todo object with the generated id
    const todo = { id, title: todoData.title };

    logger.info("Creating todo:", todo);

    await sendMessage('todo-events', { action: 'create', data: todo });

    return todo;
};