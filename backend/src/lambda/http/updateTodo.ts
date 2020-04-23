import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/Todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event ${event}`)

    const { todoId } = event.pathParameters 
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const authHeader = event.headers.Authorization

    updateTodo(updatedTodo, todoId, authHeader)

    return {
      statusCode: 200,
      body: JSON.stringify(updatedTodo)
    }
  }
).use(cors())
