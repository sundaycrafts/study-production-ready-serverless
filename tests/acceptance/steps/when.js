'use strict';

const URL = require('url')
const axios = require('axios')
const aws4 = require('aws4')
const {TEST_ROOT} = process.env;

const setAwsAccessKeyId = require('../../../helpers/setAwsAccessKeyIds')

const generateSignHeaders = async (url, iam_auth) => {
  const {hostname, pathname} = URL.parse(url)
  let opts = {
    host: hostname, 
    path: pathname
  };

  if (iam_auth) await setAwsAccessKeyId()
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
  const iam_auth = opts.iam_auth || false
  const {body: data, idToken} = opts

  const signHeaders = await generateSignHeaders(url, iam_auth)

  let headers
  if (idToken) {
    headers = {...signHeaders, 'Authorization': idToken}
  } else if (iam_auth) {
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

exports.we_invoke_get_index = () => viaHttp('', 'get')

exports.we_invoke_get_restaurants = () => viaHttp('restaurants', 'get', { iam_auth: true })

exports.we_invoke_search_restaurants = (idToken, theme) => {
  const body = JSON.stringify({theme})
  return viaHttp('restaurants/search', 'post', {body, idToken})
}
