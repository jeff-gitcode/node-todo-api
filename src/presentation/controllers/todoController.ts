import TodoRepository from '@infrastructure/repositories/todoRepository';

export class TodoController {
    private todoRepository: TodoRepository;

    constructor(todoRepository: TodoRepository) {
        this.todoRepository = todoRepository;
    }

    public async create(req: any, res: any): Promise<void> {
        try {
            const { title } = req.body;
            const todo = await this.todoRepository.addTodo(title);
            res.status(201).json(todo);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    public async getAll(req: any, res: any): Promise<void> {
        try {
            const todos = await this.todoRepository.fetchTodos();
            res.status(200).json(todos);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    public async delete(req: any, res: any): Promise<void> {
        try {
            const { id } = req.params;
            await this.todoRepository.deleteTodo(id);
            res.status(204).send();
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }

    public async update(req: any, res: any): Promise<void> {
        try {
            const { id } = req.params;
            const { title } = req.body;
            const updatedTodo = await this.todoRepository.updateTodo(id, title);
            res.status(200).json(updatedTodo);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }
}