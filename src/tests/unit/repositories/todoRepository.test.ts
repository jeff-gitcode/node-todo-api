import { Todo } from "@domain/entities/todo";
import TodoRepository from "@infrastructure/repositories/todoRepository";
import { ObjectId } from "mongodb";

describe('TodoRepository', () => {
    let mockClient: any;
    let todoRepository: TodoRepository;

    beforeEach(() => {
        mockClient = {
            db: jest.fn().mockReturnValue({
                collection: jest.fn().mockReturnValue({
                    insertOne: jest.fn(),
                    find: jest.fn().mockReturnValue({
                        toArray: jest.fn(),
                    }),
                    deleteOne: jest.fn(),
                    findOneAndUpdate: jest.fn(),
                }),
            }),
        };
        todoRepository = new TodoRepository(mockClient, 'test-database');
    });

    describe('addTodo', () => {
        it('should add a todo and return it', async () => {
            const todo = new Todo(new ObjectId().toString(), 'Test Todo');
            const mockInsertOne = mockClient.db().collection().insertOne;
            mockInsertOne.mockResolvedValue({ insertedId: todo.id });

            const result = await todoRepository.addTodo(todo);

            expect(mockInsertOne).toHaveBeenCalledWith({
                _id: new ObjectId(todo.id),
                title: todo.title,
            });
            expect(result).toEqual(todo);
        });
    });

    describe('fetchTodos', () => {
        it('should fetch all todos', async () => {
            const todos = [
                { _id: new ObjectId().toString(), title: 'Todo 1' },
                { _id: new ObjectId().toString(), title: 'Todo 2' },
            ];
            const mockToArray = mockClient.db().collection().find().toArray;
            mockToArray.mockResolvedValue(todos);

            const result = await todoRepository.fetchTodos();

            expect(mockToArray).toHaveBeenCalled();
            expect(result).toEqual(todos);
        });
    });

    describe('deleteTodo', () => {
        it('should delete a todo by id', async () => {
            const id = new ObjectId().toString();
            const mockDeleteOne = mockClient.db().collection().deleteOne;
            mockDeleteOne.mockResolvedValue({ deletedCount: 1 });

            await todoRepository.deleteTodo(id);

            expect(mockDeleteOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
        });

        it('should not throw an error if no todo is deleted', async () => {
            const id = new ObjectId().toString();
            const mockDeleteOne = mockClient.db().collection().deleteOne;
            mockDeleteOne.mockResolvedValue({ deletedCount: 0 });

            await expect(todoRepository.deleteTodo(id)).resolves.not.toThrow();
        });
    });

    describe('updateTodo', () => {
        it('should update a todo and return the updated todo', async () => {
            const id = new ObjectId().toString();
            const title = 'Updated Todo';
            const updatedTodo = { _id: new ObjectId(id), title };
            const mockFindOneAndUpdate = mockClient.db().collection().findOneAndUpdate;
            mockFindOneAndUpdate.mockResolvedValue({ value: updatedTodo });

            const result = await todoRepository.updateTodo(id, title);

            expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
                { _id: new ObjectId(id) },
                { $set: { title } },
                { returnDocument: 'after' }
            );
            expect(result).toEqual({ id: updatedTodo._id, title: updatedTodo.title });
        });

        it('should throw an error if the todo is not found', async () => {
            const id = new ObjectId().toString();
            const title = 'Updated Todo';
            const mockFindOneAndUpdate = mockClient.db().collection().findOneAndUpdate;
            mockFindOneAndUpdate.mockResolvedValue({ value: null });

            await expect(todoRepository.updateTodo(id, title)).rejects.toThrow('Todo not found');
        });
    });
});