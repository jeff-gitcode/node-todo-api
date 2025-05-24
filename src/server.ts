import express from 'express';
import morgan from 'morgan';
import logger from './logger'; // Import the logger
import { connectToDatabase } from '@infrastructure/database/mongoClient';
import todoRoutes from '@presentation/routes/todoRoutes';
import { config } from '@config/index';
import { connectConsumer } from '@infrastructure/kafka/kafkaConsumer';
import { connectProducer } from '@infrastructure/kafka/kafkaProducer';

const app = express();
const PORT = config.port;

// Middleware to log HTTP requests using morgan
app.use(
    morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim()), // Use pino for logging morgan messages
        },
    })
);

app.use(express.json());

const startServer = async () => {
    try {
        // Connect to the database
        await connectToDatabase();
        logger.info('Database connected successfully.');

        // Connect Kafka producer and consumer
        await connectProducer();
        logger.info('Kafka producer connected.');
        await connectConsumer();
        logger.info('Kafka consumer connected.');

        // Register routes only after the database connection is established
        app.use('/', todoRoutes());

        // Start the server
        app.listen(PORT, () => {
            logger.info(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        logger.error(`Database connection failed: ${err}`);
        process.exit(1); // Exit the process with a failure code
    }
};

// Start the server
startServer();