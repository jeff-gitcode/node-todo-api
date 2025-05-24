export const deleteTodo = async (id: string, todoRepository: any): Promise<void> => {
    await todoRepository.deleteTodo(id);
};