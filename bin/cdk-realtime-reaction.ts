#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { CdkRealtimeReactionStack } from "../lib/cdk-realtime-reaction-stack";
import { CdkWebsocketLambdaStack } from "../lib/cdk-websocket-lambda";

const app = new cdk.App();
new CdkRealtimeReactionStack(app, "CdkRealtimeReactionStack", {});

new CdkWebsocketLambdaStack(app, "websocket-api-stack");
