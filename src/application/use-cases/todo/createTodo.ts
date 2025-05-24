import { Todo } from '@domain/entities/todo';
import TodoRepository from '@infrastructure/repositories/todoRepository';

export const createTodo = async (todoData: { title: string }, todoRepository: TodoRepository): Promise<Todo> => {
    if (!todoData.title) {
        throw new Error('Title is required');
    }

    const todo = { title: todoData.title };
    const result = await todoRepository.addTodo(todo.title);
    return result;
};