'use strict';

const APP_ROOT = '../../'
const get = require('lodash/get')

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

exports.we_invoke_get_index = () => viaHandler({}, 'get-index')
exports.we_invoke_get_restaurants = () => viaHandler({}, 'get-restaurants')
exports.we_invoke_search_restaurants = theme => viaHandler(
  {body: JSON.stringify({theme})},
  'search-restaurants'
);
