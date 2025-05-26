import express from 'express';
import morgan from 'morgan';
import logger from './logger'; // Import the logger
import todoRoutes from '@presentation/routes/todoRoutes';
import { config } from '@config/index';
import { KafkaConsumer } from '@infrastructure/kafka/kafkaConsumer';
import { KafkaProducer } from '@infrastructure/kafka/kafkaProducer';
import { registerInfrastructureService } from '@infrastructure/di';
import { container } from './container';

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
        // await connectToDatabase();
        // logger.info('Database connected successfully.');
        await registerInfrastructureService();
        logger.info('Dependencies bootstrapped successfully.');

        // Connect Kafka producer and consumer
        // Resolve KafkaProducer and KafkaConsumer
        const kafkaProducer = container.get<KafkaProducer>('KafkaProducer');
        const kafkaConsumer = container.get<KafkaConsumer>('KafkaConsumer');

        // Connect Kafka producer and consumer
        await kafkaProducer.connect();
        logger.info('Kafka producer connected.');

        await kafkaConsumer.connect();
        await kafkaConsumer.subscribe('todo-events');
        await kafkaConsumer.run();
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

// Export the app for testing
export { app };