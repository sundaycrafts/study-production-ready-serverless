'use strict';

const {promisifyAll} = require('bluebird')
const awscred = promisifyAll(require('awscred'))

module.exports = async () => {
  if (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SESSION_TOKEN) return

  /***
   * # Why does awscred need?
   * Needs awscred because the aws4 library
   * that we used to sign our HTTP request doesn't work with AWS profiles (IAM).
   *
   * # How does awscred work?
   * Awscred retrieve AWS credentials and region details using,
   * in order: environment variables, INI files, and HTTP calls.
   * https://github.com/mhart/awscred/blob/master/index.js#L224-L234
   * https://github.com/mhart/awscred/blob/master/index.js#L100-L108
   *
   * # Why awscred will not be needed actually in production?
   * because AWS will supply a temporary token for `X-Amz-Security-Token`
   * from environment variable named `AWS_SESSION_TOKEN` in production env.
   * https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html
   */
  const {credentials: {accessKeyId, secretAccessKey}} = await awscred.loadAsync()
  process.env.AWS_ACCESS_KEY_ID = accessKeyId
  process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey
}
