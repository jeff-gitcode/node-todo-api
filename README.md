# Todo API

This project is a simple Todo API implemented using Node.js, Express, and TypeScript, following the principles of Clean Architecture. It uses MongoDB as the database and the native MongoClient to connect to it.

## Project Structure

```
todo-api
├── src
│   ├── application
│   │   ├── use-cases
│   │   │   └── todo
│   │   │       ├── createTodo.ts
│   │   │       └── getTodos.ts
│   ├── domain
│   │   └── entities
│   │       └── todo.ts
│   ├── infrastructure
│   │   ├── database
│   │   │   └── mongoClient.ts
│   │   └── repositories
│   │       └── todoRepository.ts
│   ├── interfaces
│   │   ├── controllers
│   │   │   └── todoController.ts
│   │   ├── routes
│   │   │   └── todoRoutes.ts
│   │   └── http
│   │       └── test.http
│   ├── config
│   │   └── index.ts
│   └── server.ts
├── tests
│   ├── integration
│   │   └── todoIntegration.test.ts
│   └── unit
│       ├── use-cases
│       │   └── createTodo.test.ts
│       └── repositories
│           └── todoRepository.test.ts
├── package.json
├── tsconfig.json
├── tsconfig.paths.json
└── README.md
```

## Features

- Create a new todo item
- Retrieve all todo items
- Clean architecture structure for maintainability and scalability

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd todo-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your MongoDB connection in `src/config/index.ts`.

4. Start the server:
   ```
   npm run start
   ```

## Usage

- To create a todo, send a POST request to `/todos` with a JSON body containing the `title`.
- To fetch all todos, send a GET request to `/todos`.

## Testing

- Unit tests can be run using:
  ```
  npm run test:unit
  ```

- Integration tests can be run using:
  ```
  npm run test:integration
  ```

## License

This project is licensed under the MIT License.