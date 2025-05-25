import { Todo } from '@domain/entities/todo';
import { MongoClient, ObjectId } from 'mongodb';

class TodoRepository {
    private readonly client: MongoClient;
    private readonly databaseName: string;

    constructor(client: MongoClient, databaseName: string) {
        this.client = client;
        this.databaseName = databaseName;
    }

    private get db() {
        return this.client.db(this.databaseName);
    }

    async addTodo(todo: Todo): Promise<Todo> {
        try {
            const result = await this.db.collection('todos').insertOne({
                _id: new ObjectId(todo.id),
                title: todo.title,
            });
            return todo;

        } catch (error) {
            console.error('Error adding todo:', error);
            throw new Error('Failed to add todo');
        }
    }

    async fetchTodos(): Promise<any[]> {
        return await this.db.collection('todos').find().toArray();
    }

    async deleteTodo(id: string): Promise<void> {
        await this.db.collection('todos').deleteOne({ _id: new ObjectId(id) });
    }

    async updateTodo(id: string, title: string): Promise<any> {
        const result = await this.db.collection('todos').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { title } },
            { returnDocument: 'after' }
        );
        if (!result.value) {
            throw new Error('Todo not found');
        }
        return { id: result.value._id, title: result.value.title };
    }
}

export default TodoRepository;