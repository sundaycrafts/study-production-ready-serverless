"use strict";

// https://docs.aws.amazon.com/sdk-for-javascript/index.html
const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();
const chance = require("chance").Chance();
const { cognito_user_pool_id, cognito_server_client_id } = process.env;

// needs number, special char, upper and lower case as a aws cognito regulation
const randomPassword = () => `${chance.string({ length: 8 })}B!gM0uth`;

const createAdminUser = async ({ cognito_user_pool_id }) => {
  const firstName = chance.first();
  const lastName = chance.last();
  const username = `test-${firstName}-${lastName}-${chance.guid()}`;
  const password = randomPassword();
  const email = `${firstName}-${lastName}@big-mouth.com`;

  const createReq = {
    UserPoolId: cognito_user_pool_id,
    Username: username,
    /* stop Cognito from sending invitation e-mails to the user when user created. */
    MessageAction: "SUPPRESS",
    TemporaryPassword: password,
    UserAttributes: [
      { Name: "given_name", Value: firstName },
      { Name: "family_name", Value: lastName },
      { Name: "email", Value: email }
    ]
  };

  await cognito.adminCreateUser(createReq).promise();

  // eslint-disable-next-line no-console
  console.log(`[${username}] - user is created`);

  return {
    firstName,
    lastName,
    username,
    password
  };
};

const initialAuth = async ({
  username,
  password,
  cognito_user_pool_id,
  cognito_server_client_id
}) => {
  const req = {
    AuthFlow: "ADMIN_NO_SRP_AUTH",
    UserPoolId: cognito_user_pool_id,
    ClientId: cognito_server_client_id,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password
    }
  };

  const res = await cognito.adminInitiateAuth(req).promise();

  // eslint-disable-next-line no-console
  console.log(`[${username}] - initialised auth flow`);

  return res
};

/* The new user is created with a temporary password,
  and on their first login attempt, they are forced to update their password */
const authChallenge = async ({
  username,
  cognito_user_pool_id,
  cognito_server_client_id,
  ChallengeName,
  Session
}) => {
  const challengeReq = {
    UserPoolId: cognito_user_pool_id,
    ClientId: cognito_server_client_id,
    ChallengeName: ChallengeName,
    Session: Session,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: randomPassword()
    }
  };

  const res = await cognito.adminRespondToAuthChallenge(challengeReq).promise();

  // eslint-disable-next-line no-console
  console.log(`[${username}] - responded to auth challenge`);

  return res
};

exports.an_authenticated_user = async () => {
  const { firstName, lastName, username, password } = await createAdminUser({
    cognito_user_pool_id
  });

  const { ChallengeName, Session } = await initialAuth({
    username,
    password,
    cognito_user_pool_id,
    cognito_server_client_id
  });

  const { AuthenticationResult: {IdToken: idToken} } = await authChallenge({
    username,
    cognito_user_pool_id,
    cognito_server_client_id,
    ChallengeName,
    Session
  });

  return {
    username,
    firstName,
    lastName,
    idToken
  };
};
