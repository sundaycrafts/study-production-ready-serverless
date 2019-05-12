'use strict';
const env = require('dotenv')
const {promisifyAll} = require('bluebird')
const awscred = promisifyAll(require('awscred'))

let initialized = false
module.exports = async () => {
  if (initialized) return
  env.config()

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
   * # Why awscred doesn't need in production?
   * because AWS will supply `X-Amz-Security-Token` environment variable in production env.
   * https://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html
   */
  const {credentials: {accessKeyId, secretAccessKey}} = await awscred.loadAsync()
  process.env.AWS_ACCESS_KEY_ID = accessKeyId
  process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey

  initialized = true
}
