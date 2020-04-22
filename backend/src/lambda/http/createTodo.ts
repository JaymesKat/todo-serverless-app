import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as uuid from 'uuid'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoDbAdapter } from '../databaseAdapters/todoDbAdapter'
import { TodoItem } from '../../models/TodoItem'
import { parseUserId, getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')
const todoDbAdapter = new TodoDbAdapter()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event ${event}`)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const token = getToken(event.headers.Authorization)
  const userId = parseUserId(token)

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

  todoDbAdapter.createTodo(newItem)

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newItem
    })
  }
}).use(cors())
