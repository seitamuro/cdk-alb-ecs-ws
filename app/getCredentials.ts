import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
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
  showAccessTokens(credentials);
};

main();
