import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { SNSClient, SubscribeCommand } from "@aws-sdk/client-sns";
import {
  CognitoIdentityCredentials,
  fromCognitoIdentityPool,
} from "@aws-sdk/credential-provider-cognito-identity";

const IDENTITY_POOL_ID = "us-east-1:c550fdf9-724d-411a-95d0-d2e9735270a1";
const REGION = "us-east-1";

const client = new CognitoIdentityClient({ region: REGION });

const credentialsProvider = fromCognitoIdentityPool({
  client: client,
  identityPoolId: IDENTITY_POOL_ID,
});

const showAccessTokens = async (credentials: CognitoIdentityCredentials) => {
  const accessKeyId = await credentials.accessKeyId;
  const secretAccessKey = await credentials.secretAccessKey;
  const sessionToken = await credentials.sessionToken;

  console.log("Access Key ID: ", accessKeyId);
  console.log("Secret Access Key: ", secretAccessKey);
  console.log("Session Token: ", sessionToken);
};

const main = async () => {
  const credentials = await credentialsProvider();

  const snsClient = new SNSClient({
    region: REGION,
    credentials: credentials,
  });

  const subscribeCommand = new SubscribeCommand({
    Protocol: "https",
    TopicArn:
      "arn:aws:sns:us-east-1:230806776430:CdkRealtimeReactionStack-ReactionTopic81B813D4-QO0RaSwJmSk4",
    Endpoint:
      "https://5dmceb46zhjnjdcxkw4wceu2rq0ztecx.lambda-url.us-east-1.on.aws/",
  });

  try {
    await snsClient.send(subscribeCommand);
    console.log("Subscribed to SNS topic");
  } catch (err) {
    console.error(err);
  }

  //showAccessTokens(credentials);
};

main();
