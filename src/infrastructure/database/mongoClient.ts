import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from '@config/index';
import logger from '@src/logger';

let client: MongoClient | null = null;
let memoryServer: MongoMemoryServer | null = null;

export const connectToDatabase = async (): Promise<MongoClient> => {
    if (!client) {
        logger.info('Connecting to MongoDB...', process.env.NODE_ENV);
        if (process.env.NODE_ENV === 'test') {
            // Use MongoMemoryServer for test environment
            memoryServer = await MongoMemoryServer.create();
            const uri = memoryServer.getUri();
            logger.info('Using MongoMemoryServer URI:', uri);
            client = new MongoClient(uri);
        } else {
            // Use the real MongoDB URI for other environments
            logger.info('Using real MongoDB URI:', config.mongoURI);
            client = new MongoClient(config.mongoURI);
        }
        await client.connect();
    }
    return client;
};

export const getMongoClient = (): MongoClient => {
    if (!client) {
        throw new Error('MongoClient has not been initialized. Call connectToDatabase first.');
    }
    return client;
};

export const stopMemoryServer = async (): Promise<void> => {
    if (memoryServer) {
        await memoryServer.stop();
        memoryServer = null;
    }
    if (client) {
        await client.close();
        client = null;
    }
};