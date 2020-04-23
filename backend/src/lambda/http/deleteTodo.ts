import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { deleteTodo } from '../../businessLogic/Todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event ${event}`)

  const { todoId } = event.pathParameters 
  const authHeader = event.headers.Authorization
  await deleteTodo(todoId, authHeader)

  return {
    statusCode: 200,
    body: ''
  }
}).use(cors())
