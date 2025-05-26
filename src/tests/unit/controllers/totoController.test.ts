import TodoRepository from '@infrastructure/repositories/todoRepository';
import { createTodo } from '@application/use-cases/todo/createTodo';
import { deleteTodo } from '@application/use-cases/todo/deleteTodo';
import { updateTodo } from '@application/use-cases/todo/updateTodo';
import { TodoController } from '@presentation/controllers/todoController';

jest.mock('@application/use-cases/todo/createTodo');
jest.mock('@application/use-cases/todo/deleteTodo');
jest.mock('@application/use-cases/todo/updateTodo');
jest.mock('@infrastructure/repositories/todoRepository');

describe('TodoController', () => {
    let todoRepository: jest.Mocked<TodoRepository>;
    let todoController: TodoController;
    let mockRequest: any;
    let mockResponse: any;

    beforeEach(() => {
        // Mock the TodoRepository methods
        todoRepository = {
            fetchTodos: jest.fn(),
        } as unknown as jest.Mocked<TodoRepository>;

        // Create an instance of TodoController with the mocked repository
        todoController = new TodoController(todoRepository);

        // Mock request and response objects
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new todo and return it with status 201', async () => {
            const todo = { id: '1', title: 'Test Todo' };
            mockRequest.body = { title: 'Test Todo' };
            (createTodo as jest.Mock).mockResolvedValue(todo);

            await todoController.create(mockRequest, mockResponse);

            expect(createTodo).toHaveBeenCalledWith({ title: 'Test Todo' });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(todo);
        });

        it('should return status 500 if an error occurs', async () => {
            mockRequest.body = { title: 'Test Todo' };
            (createTodo as jest.Mock).mockRejectedValue(new Error('Create error'));

            await todoController.create(mockRequest, mockResponse);

            expect(createTodo).toHaveBeenCalledWith({ title: 'Test Todo' });
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Create error' });
        });
    });

    describe('getAll', () => {
        it('should fetch all todos and return them with status 200', async () => {
            const todos = [{ id: '1', title: 'Test Todo' }];
            todoRepository.fetchTodos.mockResolvedValue(todos);

            await todoController.getAll(mockRequest, mockResponse);

            expect(todoRepository.fetchTodos).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(todos);
        });

        it('should return status 500 if an error occurs', async () => {
            todoRepository.fetchTodos.mockRejectedValue(new Error('Fetch error'));

            await todoController.getAll(mockRequest, mockResponse);

            expect(todoRepository.fetchTodos).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Fetch error' });
        });
    });

    describe('delete', () => {
        it('should delete a todo and return status 204', async () => {
            mockRequest.params = { id: '1' };
            (deleteTodo as jest.Mock).mockResolvedValue(undefined);

            await todoController.delete(mockRequest, mockResponse);

            expect(deleteTodo).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('should return status 500 if an error occurs', async () => {
            mockRequest.params = { id: '1' };
            (deleteTodo as jest.Mock).mockRejectedValue(new Error('Delete error'));

            await todoController.delete(mockRequest, mockResponse);

            expect(deleteTodo).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Delete error' });
        });
    });

    describe('update', () => {
        it('should update a todo and return it with status 200', async () => {
            const updatedTodo = { id: '1', title: 'Updated Todo' };
            mockRequest.params = { id: '1' };
            mockRequest.body = { title: 'Updated Todo' };
            (updateTodo as jest.Mock).mockResolvedValue(updatedTodo);

            await todoController.update(mockRequest, mockResponse);

            expect(updateTodo).toHaveBeenCalledWith('1', 'Updated Todo');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updatedTodo);
        });

        it('should return status 500 if an error occurs', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.body = { title: 'Updated Todo' };
            (updateTodo as jest.Mock).mockRejectedValue(new Error('Update error'));

            await todoController.update(mockRequest, mockResponse);

            expect(updateTodo).toHaveBeenCalledWith('1', 'Updated Todo');
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Update error' });
        });
    });
});