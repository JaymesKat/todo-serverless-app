import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import { TodoDbAdapter } from '../databaseAdapters/todoDbAdapter'

const logger = createLogger('updateTodos')

const todoDbAdapter = new TodoDbAdapter()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event ${event}`)

    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    const { done,  dueDate } = updatedTodo

    todoDbAdapter.updateTodo(todoId, done, dueDate)

    return {
      statusCode: 200,
      body: JSON.stringify(updatedTodo)
    }
  }
).use(cors())
