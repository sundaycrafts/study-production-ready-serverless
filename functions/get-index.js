'use strict';

const {promisifyAll} = require('bluebird')
const fs = promisifyAll(require('fs'))
const path = require('path')
const Mustache = require('mustache')
const axios = require('axios')
const aws4 = require('aws4')
const URL = require('url')

const setAwsAccessKeyId = require('../helpers/setAwsAccessKeyIds')

const awsRegion = process.env.AWS_REGION
const cognitoUserPoolId = process.env.cognito_user_pool_id
const cognitoClientId = process.env.cognito_client_id
 
const restaurantsApiRoot = process.env.restaurants_api
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

var html

const loadHtml = async () => {
  if (!html) {
    html = fs.readFileAsync(path.join(__dirname, '../static/index.html'), 'utf-8')
  }

  return html
}

const getRestaurants = async () => {
  const {hostname, pathname} = URL.parse(restaurantsApiRoot)

  let opts = {
    host: hostname,
    path: pathname
  }

  await setAwsAccessKeyId()

  /* aws4 assumes AWS credentials are available in process.env
    https://github.com/mhart/aws4/blob/master/aws4.js#L282-L289 */
  aws4.sign(opts)

  /* Be sure you run axios in node environment when testing
    https://github.com/axios/axios/issues/1754#issuecomment-435784235 */
  const client = axios.create({timeout: 2000})
  const {data} = await client({
    method: 'get',
    url: restaurantsApiRoot,
    headers: opts.headers
  })
  return data
}

module.exports.handler = async (_event) => {
  const template = await loadHtml()
  const restaurants = await getRestaurants()
  const dayOfWeek = days[new Date().getDay()]
  const view = {
    dayOfWeek,
    restaurants,
    awsRegion,
    cognitoUserPoolId,
    cognitoClientId,
    searchUrl: `${restaurantsApiRoot}/search`
  }
  const html = Mustache.render(template, view)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8'
    },
    body: html
  };
};
