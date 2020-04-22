# todo-serverless-app
A TODO application built with common serverless stack technologies in AWS: API Gateway, Lambda, DynamoDB and S3 

# How the application works

A user can view, create, update and delete todo items. Each todo item can optionally have an attachment image. Each user can view only TODO items that he/she has created. A user needs to be authenticated before accessing the application

# How to run the application

## Backend

To deploy the application to AWS, run the following commands:

```
cd backend
npm install
sls deploy -v
```
Ensure that you have set up your AWS credentials locally

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. 

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```
And then run the following commands:
```
cd client
npm install
npm run start
```
