'use strict';

const APP_ROOT = '../../'
const get = require('lodash/get')

exports.we_invoke_get_index = async () => {
  const handler = require(`${APP_ROOT}/functions/get-index`).handler
  const context = {}

  const response = await handler({}, context)

  const contentType = get(response, 'headers.Content-Type', 'application.json')

  if (response.body && contentType === 'application.json') {
    response.body = JSON.parse(response.body)
  }

  return response
}
