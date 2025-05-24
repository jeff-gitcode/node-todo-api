export const getTodos = async (todoRepository: any) => {
    return await todoRepository.fetchTodos();
};