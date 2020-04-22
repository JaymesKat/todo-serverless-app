import Axios from 'axios'
import { Jwk } from './Jwk'
import { certToPEM } from './utils'
import { createLogger } from '../utils/logger'

const logger = createLogger('JWK client')

export class JwksClient {
  constructor(
    private jwksUrl = process.env.JWKS_ENDPOINT
  ){
  }
  async getJwks(): Promise<Array<Jwk>> {
    try {
      const {
        data: { keys }
      } = await Axios({
        method: 'get',
        url: this.jwksUrl,
        responseType: 'json'
      })

      return keys
    } catch (error) {
      logger.error('JWK request failed')
    }
  }

  async getSigningKeys() {
    const keys = await this.getJwks()

    if (!keys || !keys.length) {
      throw new Error('The JWKS endpoint did not contain any keys')
    }

    const signingKeys = keys
      .filter(
        (key) =>
          key.use === 'sig' &&
          key.kty === 'RSA' &&
          key.kid &&
          ((key.x5c && key.x5c.length) || (key.n && key.e))
      )
      .map((key) => {
        return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) }
      })

    if (!signingKeys.length) {
      throw new Error('The JWKS endpoint did not contain any signing keys')
    }

    return signingKeys
  }

  async getSigningKey(kid) {
    try {
      const keys = await this.getSigningKeys()
      const signingKey = keys.find((key) => key.kid === kid)

      if (!signingKey) {
        var error = new Error(
          `Unable to find a signing key that matches '${kid}'`
        )
        throw error
      }

      return signingKey.publicKey
    } catch (error) {
      logger.error(error.message)
    }
  }
}
