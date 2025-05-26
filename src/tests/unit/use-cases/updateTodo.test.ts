import { updateTodo } from '@application/use-cases/todo/updateTodo';
import { sendMessage } from '@infrastructure/kafka/kafkaProducer';

jest.mock('@infrastructure/kafka/kafkaProducer', () => ({
    sendMessage: jest.fn(),
}));

describe('updateTodo', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update a todo', async () => {
        const todoId = '1';
        const updatedTitle = 'Updated Todo';
        const updatedTodo = { id: todoId, title: updatedTitle };

        // Call the updateTodo function
        const result = await updateTodo(todoId, updatedTitle);

        // Verify the returned updated todo object
        expect(result).toEqual(updatedTodo);

        // Verify that sendMessage was called with the correct arguments
        expect(sendMessage).toHaveBeenCalledTimes(1);
        expect(sendMessage).toHaveBeenCalledWith('todo-events', {
            action: 'update',
            data: {
                id: todoId,
                title: updatedTitle,
            },
        });
    });

    it('should throw an error if title is missing', async () => {
        const todoId = '1';
        const updatedTitle = '';

        await expect(updateTodo(todoId, updatedTitle)).rejects.toThrow('Title is required');
    });
});