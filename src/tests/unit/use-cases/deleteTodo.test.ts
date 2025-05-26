import { deleteTodo } from '@application/use-cases/todo/deleteTodo';
import { sendMessage } from '@infrastructure/kafka/kafkaProducer';

jest.mock('@infrastructure/kafka/kafkaProducer', () => ({
    sendMessage: jest.fn(),
}));

describe('deleteTodo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should send a Kafka message with the correct action and data', async () => {
        const todoId = '123';

        // Call the deleteTodo function
        await deleteTodo(todoId);

        // Verify that sendMessage was called with the correct arguments
        expect(sendMessage).toHaveBeenCalledTimes(1);
        expect(sendMessage).toHaveBeenCalledWith('todo-events', {
            action: 'delete',
            data: { id: todoId },
        });
    });
});