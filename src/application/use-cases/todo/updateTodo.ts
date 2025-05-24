export const updateTodo = async (id: string, title: string, todoRepository: any): Promise<any> => {
    if (!title) {
        throw new Error('Title is required');
    }
    return await todoRepository.updateTodo(id, title);
};