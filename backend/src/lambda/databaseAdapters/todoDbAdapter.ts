// import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createDynamoDBClient } from '../../utils/createDbClient'
import { TodoItem } from '../../models/TodoItem'

import { createLogger } from '../../utils/logger'
const logger = createLogger('dbAccess')

export class TodoDbAdapter {

    constructor(
        private docClient: DocumentClient = createDynamoDBClient(),
        private todosTable = process.env.TODOS_TABLE,
        private todoIdIndex = process.env.TODO_INDEX_NAME
    ){
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {

          const result = await this.docClient.query({
            TableName : this.todosTable,
            IndexName: this.todoIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
 
          return result.Items as TodoItem[]
    }

    async getTodo(todoId: string): Promise<TodoItem> {

        const result = await this.docClient.query({
            TableName : this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId
            }
        }).promise()

        return result.Items[0] as TodoItem
    }

    async createTodo(todo: TodoItem): Promise<TodoItem>{
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
          }).promise()

        return todo as TodoItem
    }

    deleteTodo(todoId: string): void {
        this.docClient.delete({
            TableName: this.todosTable,
            Key: { "todoId" : todoId }
        })
    }

    updateTodo(todoId: string, done:boolean, dueDate: string): void {
        this.docClient
        .update({
          TableName: this.todosTable,
          Key: { todoId, dueDate },
          UpdateExpression: 'set done = :done',
          ConditionExpression: 'todoId = :todoId',
          ExpressionAttributeValues: {
            ':todoId': todoId,
            ':done': done
          }
        })
    }

    async updateAttachment(todoId: string, bucketName: string): Promise<void>{
        const todo = await this.getTodo(todoId)
        const { dueDate } = todo

        const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

        const result = await this.docClient
        .update({
          TableName: this.todosTable,
          Key: { todoId, dueDate },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ConditionExpression: 'todoId = :todoId',
          ExpressionAttributeValues: {
            ':todoId': todoId,
            ':attachmentUrl': attachmentUrl
          }
        }).promise()
        logger.info("Result", result)
    }
}