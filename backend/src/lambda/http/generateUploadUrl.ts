import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { generatePutSignedUrl } from '../../utils/s3'
import { TodoDbAdapter } from '../databaseAdapters/todoDbAdapter'
import { createLogger } from '../../utils/logger'

const logger = createLogger('File upload')

const bucketName = process.env.IMAGES_S3_BUCKET

const todoDbAdapter = new TodoDbAdapter()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event ${event}`)
  const todoId = event.pathParameters.todoId

  const signedUrl = generatePutSignedUrl(todoId);

  await todoDbAdapter.updateAttachment(todoId, bucketName)

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  }
}).use(cors())
