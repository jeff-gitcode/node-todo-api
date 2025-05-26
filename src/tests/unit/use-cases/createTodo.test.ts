import { createTodo } from '@application/use-cases/todo/createTodo';
import { sendMessage } from '@infrastructure/kafka/kafkaProducer';
import logger from '../../../logger';

jest.mock('@infrastructure/kafka/kafkaProducer', () => ({
    sendMessage: jest.fn(),
}));

jest.mock('../../../logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));

describe('createTodo', () => {

    beforeEach(() => {
        // Mock the MongoClient
        jest.clearAllMocks();
    });

    it('should create a new todo and send a Kafka message', async () => {
        const title = 'Test Todo';

        // Call the createTodo function
        const result = await createTodo({ title });

        // Verify the returned todo object
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title', title);

        // Verify that sendMessage was called with the correct arguments
        expect(sendMessage).toHaveBeenCalledWith('todo-events', {
            action: 'create',
            data: result,
        });

        // Verify that logger.info was called
        expect(logger.info).toHaveBeenCalledWith('Creating todo:', result);
    });

    it('should throw an error if title is missing', async () => {
        await expect(createTodo({ title: '' })).rejects.toThrow('Title is required');
    });
});