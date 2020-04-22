import * as AWS  from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk-core');

const XAWS = AWSXRay.captureAWS(AWS)

/**
 * Create a dynamoDb client instance
 */

export function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
}
