import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { TodoDbAdapter } from '../databaseAdapters/todoDbAdapter'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodos')
const todoDbAdapter = new TodoDbAdapter()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event ${event}`)
  
  const todoId = event.pathParameters.todoId

  todoDbAdapter.deleteTodo(todoId)

  return {
    statusCode: 200,
    body: ''
  }
}).use(cors())
