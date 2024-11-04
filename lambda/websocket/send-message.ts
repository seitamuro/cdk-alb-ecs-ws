import { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import * as AWS from "aws-sdk";

const ddb = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  let connections;
  try {
    connections = (
      await ddb.scan({ TableName: process.env.TABLE_NAME ?? "" }).promise()
    ).Items as { connectionId: string }[];
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Failed to connect: " + JSON.stringify(err),
    };
  }

  const callbackAPI = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  console.log("Received message: ", JSON.stringify(event));
  const body = JSON.parse(event.body ?? "{}");

  const sendMessages = connections.map(async (connection) => {
    try {
      await callbackAPI
        .postToConnection({
          ConnectionId: connection.connectionId,
          Data: JSON.stringify({ message: body.message }),
        })
        .promise();
    } catch (err) {
      if (err.statusCode === 410) {
        await ddb
          .delete({
            TableName: process.env.TABLE_NAME ?? "",
            Key: { connectionId: connection.connectionId },
          })
          .promise();
      } else {
        throw err;
      }
    }
  });

  return await Promise.all(sendMessages)
    .then(() => ({
      statusCode: 200,
    }))
    .catch((e) => {
      console.error(e);
      return {
        statusCode: 500,
      };
    });
};
