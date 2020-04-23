import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { generatePutSignedUrl } from '../../utils/s3'
import { updateTodoAttachment } from '../../businessLogic/Todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger('File upload')
const bucketName = process.env.IMAGES_S3_BUCKET

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event ${event}`)

  const authHeader = event.headers.Authorization
  const { todoId } = event.pathParameters
  const signedUrl = generatePutSignedUrl(todoId)
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  logger.info('AttachmentUrl', attachmentUrl)
  await updateTodoAttachment(todoId, authHeader, attachmentUrl)

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  }
}).use(cors())
