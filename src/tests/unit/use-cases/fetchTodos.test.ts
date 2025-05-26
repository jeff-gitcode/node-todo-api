import { getTodos } from '@application/use-cases/todo/getTodos';
import TodoRepository from '@infrastructure/repositories/todoRepository';
import { MongoClient } from 'mongodb';

describe('fetchTodos', () => {
    let todoRepository: TodoRepository;
    let mockClient: MongoClient;

    beforeEach(() => {
        mockClient = new MongoClient('mongodb://localhost:27017');
        todoRepository = new TodoRepository(mockClient, 'test-db');
        jest.clearAllMocks();
    });

    it('should fetch all todos', async () => {
        const todos = [
            { id: '1', title: 'First Todo' },
            { id: '2', title: 'Second Todo' },
        ];

        jest.spyOn(todoRepository, 'fetchTodos').mockResolvedValue(todos);

        const result = await getTodos(todoRepository);

        expect(result).toEqual(todos);
        expect(todoRepository.fetchTodos).toHaveBeenCalledTimes(1);
    });
});