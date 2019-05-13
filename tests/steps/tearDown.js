"use strict";

const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.an_authenticated_user = async username => {
  await cognito
    .adminDeleteUser({
      UserPoolId: process.env.cognito_user_pool_id,
      Username: username
    })
    .promise();

  // eslint-disable-next-line no-console
  console.log(`[${username}] - user deleted`);
};
