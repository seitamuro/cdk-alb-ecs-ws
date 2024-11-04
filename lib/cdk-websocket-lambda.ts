import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketStage } from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwv2_integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as aws_lambda_nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class CdkWebsocketLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new ddb.Table(this, "ConnectionsTable", {
      partitionKey: { name: "connectionId", type: ddb.AttributeType.STRING },
      tableName: "ConnectionsTable",
    });

    const onConnectFunction = new aws_lambda_nodejs.NodejsFunction(
      this,
      "OnConnectFunction",
      {
        entry: "lambda/websocket/connect.ts",
        handler: "handler",
        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );
    table.grantReadWriteData(onConnectFunction);

    const onDisconnectFunction = new aws_lambda_nodejs.NodejsFunction(
      this,
      "OnDisconnectFunction",
      {
        entry: "lambda/websocket/disconnect.ts",
        handler: "handler",
        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );
    table.grantReadWriteData(onDisconnectFunction);

    const webSocketApi = new apigwv2.WebSocketApi(this, "WebSocketsApi", {
      routeSelectionExpression: "$request.body.action",
      connectRouteOptions: {
        integration: new apigwv2_integrations.WebSocketLambdaIntegration(
          "WebSocketsConnectIntegration",
          onConnectFunction
        ),
      },
      disconnectRouteOptions: {
        integration: new apigwv2_integrations.WebSocketLambdaIntegration(
          "WebSocketsDisconnectIntegration",
          onDisconnectFunction
        ),
      },
    });
    webSocketApi.grantManageConnections(onConnectFunction);
    webSocketApi.grantManageConnections(onDisconnectFunction);

    new WebSocketStage(this, "ProdStage", {
      webSocketApi,
      autoDeploy: true,
      stageName: "prod",
    });
  }
}
