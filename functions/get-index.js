'use strict';

const {promisifyAll} = require('bluebird')
const fs = promisifyAll(require('fs'))
const path = require('path')

var html

const loadHtml = async () => {
  if (!html) {
    html = fs.readFileAsync(path.join(__dirname, '../static/index.html'), 'utf-8')
  }

  return html
}

module.exports.handler = async (event) => {
  const html = await loadHtml()

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8'
    },
    body: html
  };
};
