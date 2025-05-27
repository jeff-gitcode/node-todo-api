import { MongoClient, ObjectId } from 'mongodb';

export class GenericRepository<T> {
    private readonly client: MongoClient;
    private readonly databaseName: string;
    private readonly collectionName: string;

    constructor(client: MongoClient, databaseName: string, collectionName: string) {
        this.client = client;
        this.databaseName = databaseName;
        this.collectionName = collectionName;
    }

    private get db() {
        return this.client.db(this.databaseName);
    }

    private get collection() {
        return this.db.collection(this.collectionName);
    }

    async add(entity: T & { id: string }): Promise<T> {
        try {
            await this.collection.insertOne({
                _id: new ObjectId(entity.id),
                ...entity,
            });
            return entity;
        } catch (error) {
            console.error(`Error adding entity to ${this.collectionName}:`, error);
            throw new Error(`Failed to add entity to ${this.collectionName}`);
        }
    }

    async fetchAll(): Promise<T[]> {
        var result = await this.collection.find().toArray();
        return result.map((item) => ({
            id: item._id.toString(),
            ...item,
        })) as T[];
    }

    async delete(id: string): Promise<void> {
        await this.collection.deleteOne({ _id: new ObjectId(id) });
    }

    async update(id: string, updates: Partial<T>): Promise<T | null> {
        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );
        if (!result.value) {
            throw new Error(`${this.collectionName} not found`);
        }
        return { id: result.value._id.toString(), ...result.value } as T;
    }
}