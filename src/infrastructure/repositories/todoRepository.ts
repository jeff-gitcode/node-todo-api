import { MongoClient, ObjectId } from 'mongodb';

class TodoRepository {
    private client: MongoClient;
    private databaseName: string;

    constructor(client: MongoClient, databaseName: string) {
        this.client = client;
        this.databaseName = databaseName;
    }

    private get db() {
        return this.client.db(this.databaseName);
    }

    async addTodo(title: string): Promise<any> {
        const todo = { title };
        const result = await this.db.collection('todos').insertOne(todo);
        return { id: result.insertedId, ...todo };
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