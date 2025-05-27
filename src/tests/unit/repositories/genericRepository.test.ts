import { GenericRepository } from '@src/infrastructure/repositories/genericRepository';
import { MongoClient, ObjectId } from 'mongodb';

describe('GenericRepository', () => {
    let mockClient: any;
    let repository: GenericRepository<any>;

    beforeEach(() => {
        mockClient = {
            db: jest.fn().mockReturnValue({
                collection: jest.fn().mockReturnValue({
                    insertOne: jest.fn(),
                    find: jest.fn().mockReturnValue({ toArray: jest.fn() }),
                    deleteOne: jest.fn(),
                    findOneAndUpdate: jest.fn(),
                }),
            }),
        };
        repository = new GenericRepository(mockClient, 'test-db', 'test-collection');
    });

    it('should add an entity', async () => {
        const validObjectId = new ObjectId().toString();
        const entity = { id: validObjectId, name: 'Test Entity' };
        const mockInsertOne = mockClient.db().collection().insertOne;

        // Mock a successful insertion
        mockInsertOne.mockResolvedValue({
            acknowledged: true,
            insertedId: new ObjectId(entity.id),
        });

        const result = await repository.add(entity);

        expect(mockInsertOne).toHaveBeenCalledWith({
            _id: new ObjectId(entity.id),
            ...entity,
        });
        expect(result).toEqual(entity);
    });

    it('should fetch all entities', async () => {
        const entities = [
            { _id: new ObjectId(), name: 'Entity 1' },
            { _id: new ObjectId(), name: 'Entity 2' }
        ];
        const mockToArray = mockClient.db().collection().find().toArray;
        mockToArray.mockResolvedValue(entities);

        const result = await repository.fetchAll();

        expect(mockToArray).toHaveBeenCalled();
        // The repository should convert _id to id
        expect(result.length).toBe(2);
        expect(result[0].id).toBeDefined();
        expect(result[0].name).toBe('Entity 1');
        expect(result[1].id).toBeDefined();
        expect(result[1].name).toBe('Entity 2');
    });

    it('should delete an entity by id', async () => {
        // Use a valid 24-character hex string for the ObjectId
        const id = '507f1f77bcf86cd799439011';
        const mockDeleteOne = mockClient.db().collection().deleteOne;
        mockDeleteOne.mockResolvedValue({ deletedCount: 1 });

        await repository.delete(id);

        expect(mockDeleteOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
    });

    it('should update an entity and return the updated entity', async () => {
        // Use a valid 24-character hex string for the ObjectId
        const id = '507f1f77bcf86cd799439011';
        const updates = { name: 'Updated Entity' };
        const updatedEntity = { _id: new ObjectId(id), ...updates };
        const mockFindOneAndUpdate = mockClient.db().collection().findOneAndUpdate;
        mockFindOneAndUpdate.mockResolvedValue({ value: updatedEntity });

        const result = await repository.update(id, updates);

        expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );
        console.log('result:', result);
        expect(result.id).toBe(updatedEntity._id.toString());
        expect(result.name).toBe(updates.name);
    });
});