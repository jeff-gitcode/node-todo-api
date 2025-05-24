import { Router } from 'express';
import { TodoController } from '@presentation/controllers/todoController';
import { getMongoClient } from '@infrastructure/database/mongoClient';
import TodoRepository from '@infrastructure/repositories/todoRepository';

const router = Router();

const todoRoutes = () => {
    const client = getMongoClient();
    const todoRepository = new TodoRepository(client, 'todo-api');
    const todoController = new TodoController(todoRepository);

    router.post('/todos', todoController.create.bind(todoController));
    router.get('/todos', todoController.getAll.bind(todoController));
    router.delete('/todos/:id', todoController.delete.bind(todoController));
    router.put('/todos/:id', todoController.update.bind(todoController));

    // Health check endpoint
    router.get('/health', (req, res) => {
        res.status(200).json({ status: 'OK', message: 'API is healthy' });
    });

    return router;
};

export default todoRoutes;