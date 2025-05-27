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
        const entity = { id: '1', name: 'Test Entity' };
        const mockInsertOne = mockClient.db().collection().insertOne;
        mockInsertOne.mockResolvedValue({ insertedId: entity.id });

        const result = await repository.add(entity);

        expect(mockInsertOne).toHaveBeenCalledWith({
            _id: new ObjectId(entity.id),
            ...entity,
        });
        expect(result).toEqual(entity);
    });

    it('should fetch all entities', async () => {
        const entities = [{ id: '1', name: 'Entity 1' }, { id: '2', name: 'Entity 2' }];
        const mockToArray = mockClient.db().collection().find().toArray;
        mockToArray.mockResolvedValue(entities);

        const result = await repository.fetchAll();

        expect(mockToArray).toHaveBeenCalled();
        expect(result).toEqual(entities);
    });

    it('should delete an entity by id', async () => {
        const id = '1';
        const mockDeleteOne = mockClient.db().collection().deleteOne;
        mockDeleteOne.mockResolvedValue({ deletedCount: 1 });

        await repository.delete(id);

        expect(mockDeleteOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
    });

    it('should update an entity and return the updated entity', async () => {
        const id = '1';
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
        expect(result).toEqual({ id: id, ...updates });
    });
});