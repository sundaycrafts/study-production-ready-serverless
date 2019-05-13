'use strict';

const URL = require('url')
const APP_ROOT = '../../'
const get = require('lodash/get')
const axios = require('axios')
const aws4 = require('aws4')
const {TEST_MODE, TEST_ROOT} = process.env;

const generateSignHeaders = url => {
  const {hostname, pathname} = URL.parse(url)
  let opts = {
    host: hostname, 
    path: pathname
  };
  aws4.sign(opts)
  return opts.headers
}

const respondFrom = ({data, status, headers}) => ({ 
  statusCode: status,
  body: data,
  headers
})

const viaHttp = async (relPath, method, opts = {}) => {
  const url = `${TEST_ROOT}/${relPath}`;
  const useIam = opts.iam_auth || false
  const {body: data, idToken} = opts

  const signHeaders = generateSignHeaders(url)

  let headers
  if (idToken) {
    headers = {...signHeaders, 'Authorization': idToken}
  } else if (useIam) {
    headers = signHeaders
  }

  const client = axios.create({
    timeout: 2000,
    method,
    url,
    data,
    headers
  })

  // eslint-disable-next-line no-console
  console.log(`invoking via HTTP ${method} ${url}`);

  try {
    const res = await client();
    return respondFrom(res);
  } catch (err) {
    if (!err.status) throw err

    return {
      statusCode: err.status,
      headers: err.response.headers
    };
  }
}

const viaHandler = async (event, functionName) => {
  const handler = require(`${APP_ROOT}/functions/${functionName}`).handler
  const context = {}

  let response = await handler(event, context)

  const contentType = get(response, 'headers.Content-Type', 'application.json')

  if (response.body && contentType === 'application.json') {
    response.body = JSON.parse(response.body)
  }

  return response
}

exports.we_invoke_get_index = () => TEST_MODE === 'handler' ?
  viaHandler({}, 'get-index') : viaHttp('', 'get')

exports.we_invoke_get_restaurants = () => TEST_MODE === 'handler' ?
  viaHandler({}, 'get-restaurants') : viaHttp('restaurants', 'get', { iam_auth: true })

exports.we_invoke_search_restaurants = (idToken, theme) => {
  const body = JSON.stringify({theme})
  return TEST_MODE === 'handler' ?
    viaHandler({body}, 'search-restaurants') : viaHttp('restaurants/search', 'post', {body, idToken})
}
