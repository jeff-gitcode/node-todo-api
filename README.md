# Clean Architecture Node Todo API

This project is a simple Todo API implemented using Node.js, Express, and TypeScript, following the principles of Clean Architecture. It uses MongoDB as the database and the native MongoClient to connect to it.

## Node Todo Api Demo
![Node Todo Api Demo](doc/node-todo-api-demo.gif)

## System Architecture

This project follows the Clean Architecture pattern, which ensures separation of concerns and maintainability. The application is divided into layers with dependencies pointing inward, ensuring that inner layers don't depend on outer layers.

```mermaid
sequenceDiagram
    participant Client
    participant Routes
    participant Controller
    participant UseCase
    participant KafkaProducer
    participant KafkaBroker
    participant KafkaConsumer
    participant Repository
    participant MongoDB

    Client->>Routes: POST /todos (title: "New Todo")
    Routes->>Controller: create(req, res)
    Controller->>UseCase: createTodo({title})
    UseCase->>UseCase: Generate ObjectId
    UseCase->>UseCase: Create Todo object
    UseCase->>KafkaProducer: sendMessage("todo-events", {action: "create", data: todo})
    KafkaProducer->>KafkaBroker: Publish message to "todo-events" topic
    KafkaBroker-->>KafkaProducer: Acknowledge message
    KafkaProducer-->>UseCase: Success
    UseCase-->>Controller: Return Todo object
    Controller-->>Client: HTTP 201 (Created)

    KafkaBroker->>KafkaConsumer: Deliver message from "todo-events" topic
    KafkaConsumer->>Repository: addTodo(todo)
    Repository->>MongoDB: insertOne(todo)
    MongoDB-->>Repository: Insertion success
    Repository-->>KafkaConsumer: Success
    KafkaConsumer-->>KafkaBroker: Commit offset
```

## Project Structure

```
todo-api
├── .env
├── .env.development
├── .env.production
├── .env.test
├── jest.config.ts
├── package.json
├── tsconfig.json
├── tsconfig.paths.json
├── src
│   ├── application
│   │   └── use-cases
│   │       └── todo
│   │           ├── createTodo.ts
│   │           ├── deleteTodo.ts
│   │           ├── getTodos.ts
│   │           └── updateTodo.ts
│   ├── config
│   │   └── index.ts
│   ├── domain
│   │   └── entities
│   │       └── todo.ts
│   ├── infrastructure
│   │   ├── database
│   │   │   └── mongoClient.ts
│   │   └── repositories
│   │       └── todoRepository.ts
│   ├── presentation
│   │   ├── controllers
│   │   │   └── todoController.ts
│   │   ├── http
│   │   │   └── test.http
│   │   └── routes
│   │       └── todoRoutes.ts
│   └── server.ts
├── tests
│   ├── integration
│   │   └── todoIntegration.test.ts
│   └── unit
│       └── ...
```

## Features

- Create a new todo item
- Retrieve all todo items
- Update a todo item
- Delete a todo item
- Health check endpoint

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd todo-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create `.env` files for different environments (`.env.development`, `.env.test`, `.env.production`).
   - Example `.env.development`:
     ```
     MONGO_URI=mongodb://localhost:27017/todo-api-dev
     PORT=3000
     ```

4. Start the server:
   - Ensure Docker is running on your machine.
   - Start the required services (MongoDB and Kafka) using Docker Compose:
     ```bash
     docker-compose up -d
     ```
   - Verify that the services are running:
     ```bash
     docker-compose ps
     ```
   - Verify Kafka & MongoDB is running:
     ```bash
     docker logs kafka
     docker exec -it mongodb mongo
     ```  
   - Start the server in development mode:
     ```bash
     npm run dev
     ```
   - When stop docker and clean cache
     ```bash
     docker-compose down -v
     rimraf ./kafka_data/
     rimraf ./mongodb_data/
     ```

## Usage

- To create a todo, send a POST request to `/todos` with a JSON body containing the `title`.
- To fetch all todos, send a GET request to `/todos`.
- To update a todo, send a PUT request to `/todos/:id` with a JSON body containing the updated `title`.
- To delete a todo, send a DELETE request to `/todos/:id`.

## Testing

- Run unit and integration tests:
  ```bash
  npm test
  ```

## License

This project is licensed under the MIT License.