// import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createDynamoDBClient } from '../utils/createDbClient'
import { TodoItem } from '../models/TodoItem'

export class TodoDbAdapter {

    constructor(
        private docClient: DocumentClient = createDynamoDBClient(),
        private todosTable = process.env.TODOS_TABLE
    ){
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {

          const result = await this.docClient.query({
            TableName : this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
 
          return result.Items as TodoItem[]
    }

    async getTodo(todoId: string, userId: string): Promise<TodoItem> {

        const result = await this.docClient.query({
            TableName : this.todosTable,
            KeyConditionExpression: 'todoId = :todoId and userId = :userId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':userId': userId
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

    deleteTodo(todoId: string, userId: string): void {
        this.docClient.delete({
            TableName: this.todosTable,
            Key: { todoId, userId }
        })
    }

    updateTodo(todoId: string, done:boolean, userId: string): void {
        this.docClient
        .update({
          TableName: this.todosTable,
          Key: { todoId, userId },
          UpdateExpression: 'set done = :done',
          ConditionExpression: 'todoId = :todoId',
          ExpressionAttributeValues: {
            ':todoId': todoId,
            ':done': done
          }
        })
    }

    async updateAttachment(todoId: string, attachmentUrl: string, userId: string): Promise<void> {
        
        await this.docClient
        .update({
          TableName: this.todosTable,
          Key: { todoId, userId },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ConditionExpression: 'todoId = :todoId',
          ExpressionAttributeValues: {
            ':todoId': todoId,
            ':attachmentUrl': attachmentUrl
          }
        }).promise()
    }
}