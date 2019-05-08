'use strict';

const {promisifyAll} = require('bluebird')
const fs = promisifyAll(require('fs'))
const path = require('path')
const Mustache = require('mustache')
const axios = require('axios')

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
  const {data} = await axios.get(restaurantsApiRoot)
  return data
}

module.exports.handler = async (event) => {
  const template = await loadHtml()
  const restaurants = await getRestaurants()
  const dayOfWeek = days[new Date().getDay()]
  const html = Mustache.render(template, {restaurants})

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8'
    },
    body: html
  };
};
