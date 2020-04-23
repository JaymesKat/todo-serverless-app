import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getAllTodos } from '../../businessLogic/Todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event ${event}`)
  
  const authHeader = event.headers.Authorization
  const todos = await getAllTodos(authHeader)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: todos
    })
  }
}).use(cors())