import express from 'express';
import { connectToDatabase } from '@infrastructure/database/mongoClient';
import todoRoutes from '@presentation/routes/todoRoutes';
import { config } from '@config/index';
import { connectConsumer } from '@infrastructure/kafka/kafkaConsumer';
import { connectProducer } from '@infrastructure/kafka/kafkaProducer';

const app = express();
const PORT = config.port;

app.use(express.json());

const startServer = async () => {
    try {
        // Connect to the database
        await connectToDatabase();
        console.log('Database connected successfully.');

        // Connect Kafka producer and consumer
        await connectProducer();
        console.log('Kafka producer connected.');
        await connectConsumer();
        console.log('Kafka consumer connected.');

        // Register routes only after the database connection is established
        app.use('/', todoRoutes());

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit the process with a failure code
    }
};

// Start the server
startServer();

// Export the app for testing
export { app };