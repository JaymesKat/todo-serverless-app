import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/Todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event ${event}`)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const authHeader = event.headers.Authorization

  const newItem = await createTodo(newTodo, authHeader)

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newItem
    })
  }
}).use(cors())
