import dotenv from 'dotenv';
import logger from '../logger';

// Load the appropriate .env file based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

console.log('Loading environment variables from:', envFile);
console.log('Environment:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI);

logger.info(`Loaded environment variables from:${envFile}`);
logger.info(`Environment: ${process.env.NODE_ENV}`);
logger.info(`MONGO_URI: ${process.env.MONGO_URI}`);

export const config = {
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/todo-api',
    port: parseInt(process.env.PORT || '3000', 10),
};