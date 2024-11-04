import { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import * as AWS from "aws-sdk";

const ddb = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  return await ddb
    .put({
      TableName: process.env.TABLE_NAME ?? "",
      Item: {
        connectionId: event.requestContext.connectionId,
        createdAt: Date.now(),
      },
    })
    .promise()
    .then(() => {
      return {
        statusCode: 200,
        body: "Connected.",
      };
    })
    .catch((err) => {
      console.error(err);
      return {
        statusCode: 500,
        body: "Failed to connect: " + JSON.stringify(err),
      };
    });
};
