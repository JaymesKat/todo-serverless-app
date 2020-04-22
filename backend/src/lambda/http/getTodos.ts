import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { TodoDbAdapter } from '../databaseAdapters/todoDbAdapter'
import { createLogger } from '../../utils/logger'
import { parseUserId, getToken } from '../../auth/utils'

const logger = createLogger('getTodos')

const todoDbAdapter = new TodoDbAdapter()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event ${event}`)

  const token = getToken(event.headers.Authorization)
  const userId = parseUserId(token)

  const todos = await todoDbAdapter.getAllTodos(userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: todos
    })
  }
}).use(cors())