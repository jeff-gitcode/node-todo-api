import dotenv from 'dotenv';

// Load the appropriate .env file based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

export const config = {
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/todo-api',
    port: parseInt(process.env.PORT || '3000', 10),
};