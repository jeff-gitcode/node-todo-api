import { container } from '@src/container';
import { KafkaProducer } from '@infrastructure/kafka/kafkaProducer';
import { KafkaConsumer } from '@infrastructure/kafka/kafkaConsumer';
import TodoRepository from '@infrastructure/repositories/todoRepository';
import { Todo } from '@domain/entities/todo';
import { ObjectId } from 'mongodb';

describe('Kafka Integration Test', () => {
    let kafkaProducer: KafkaProducer;
    let kafkaConsumer: KafkaConsumer;
    let todoRepository: TodoRepository;

    beforeAll(async () => {
        // Resolve dependencies from the DI container
        kafkaProducer = container.get<KafkaProducer>('KafkaProducer');
        kafkaConsumer = container.get<KafkaConsumer>('KafkaConsumer');
        todoRepository = container.get<TodoRepository>('TodoRepository');

        // Connect Kafka producer and consumer
        await kafkaProducer.connect();
        await kafkaConsumer.connect();
        await kafkaConsumer.subscribe('todo-events');
        await kafkaConsumer.run();
    });

    afterAll(async () => {
        // Disconnect Kafka producer and consumer
        await kafkaProducer.disconnect();
        await kafkaConsumer.disconnect();
    });

    it('should process "create" messages and insert a todo into MongoDB', async () => {
        const todoData = new Todo(new ObjectId().toString(), 'Integration Test Todo');
        // Send a "create" message to Kafka
        await kafkaProducer.sendMessage('todo-events', { action: 'create', data: todoData });

        // Wait for the consumer to process the message
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify the todo was inserted into MongoDB
        const todos = await todoRepository.fetchTodos();
        expect(todos).toHaveLength(1);
        expect(todos[0].title).toBe(todoData.title);
    });

    it('should process "update" messages and update a todo in MongoDB', async () => {
        // Insert a todo directly into MongoDB
        const todo = new Todo(new ObjectId().toString(), 'Old Title');
        await todoRepository.addTodo(todo);

        // Send an "update" message to Kafka
        const updatedData = { id: todo.id, title: 'Updated Title' };
        await kafkaProducer.sendMessage('todo-events', { action: 'update', data: updatedData });

        // Wait for the consumer to process the message
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify the todo was updated in MongoDB
        const todos = await todoRepository.fetchTodos();
        expect(todos).toHaveLength(1);
        expect(todos[0].title).toBe(updatedData.title);
    });

    it('should process "delete" messages and remove a todo from MongoDB', async () => {
        // Insert a todo directly into MongoDB
        const todo = new Todo(new ObjectId().toString(), 'Todo to Delete');
        await todoRepository.addTodo(todo);

        // Send a "delete" message to Kafka
        await kafkaProducer.sendMessage('todo-events', { action: 'delete', data: { id: todo.id } });

        // Wait for the consumer to process the message
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify the todo was deleted from MongoDB
        const todos = await todoRepository.fetchTodos();
        expect(todos).toHaveLength(0);
    });
});