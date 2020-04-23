import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoDbAdapter } from '../databaseAdapters/todoDbAdapter'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId, getToken } from '../auth/utils'

const todoDbAdapter = new TodoDbAdapter()

export async function getAllTodos(authHeader: string){
    const userId = getUserId(authHeader)
    const todos = await todoDbAdapter.getAllTodos(userId)
    return todos
}

export async function createTodo(
  newTodo: CreateTodoRequest,
  authHeader: string
  ){
    const userId = getUserId(authHeader)

    const todoId = uuid.v4()
    const name = newTodo.name
    const createdAt = new Date().toISOString()
    const done = false
    const dueDate = new Date(newTodo.dueDate).toISOString()
    
    const newItem = {
        todoId,
        userId,
        createdAt,
        done,
        dueDate,
        name
    } as TodoItem

    await todoDbAdapter.createTodo(newItem)

    return newItem;
}

export function updateTodo(updatedTodo: UpdateTodoRequest, todoId: string, authHeader:string){
    const { done } = updatedTodo
    const userId = getUserId(authHeader)

    todoDbAdapter.updateTodo(todoId, done, userId)
    return updatedTodo
}

export async function deleteTodo(todoId: string, authHeader: string){
    const userId = getUserId(authHeader)
    await todoDbAdapter.deleteTodo(todoId, userId)
}

export async function updateTodoAttachment(todoId:string, authHeader: string, attachmentUrl: string) {
    const userId = getUserId(authHeader)
    await todoDbAdapter.updateAttachment(todoId, attachmentUrl, userId)
}

function getUserId(authHeader: string): string{
    const token = getToken(authHeader)
    const userId = parseUserId(token)

    return userId
}