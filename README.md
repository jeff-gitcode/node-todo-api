# Todo API

This project is a simple Todo API implemented using Node.js, Express, and TypeScript, following the principles of Clean Architecture. It uses MongoDB as the database and the native MongoClient to connect to it.

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
   ```bash
   npm run dev
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