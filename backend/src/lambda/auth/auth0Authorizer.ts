import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { JwksClient } from '../../auth/JwksClient'
import { getToken } from '../../auth/utils'

const logger = createLogger('auth')

const jwksClient = new JwksClient()

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  logger.info('Successfully decoded token')

  const { header } = jwt

  if (!header || header.alg !== 'RS256') {
    throw new Error('Token is not RS256 encoded')
  }

  const key = await jwksClient.getSigningKey(header.kid)

  logger.info(`Verifying token`)

  return new Promise((resolve, reject) => {
    verify(
      token,
      key,
      { algorithms: ['RS256'] },
      (err, decoded: JwtPayload) => {
        if (err) {
          reject(new Error(`invalid_token ${err}`))
        } else {
          resolve(decoded)
        }
      }
    )
  })
}



