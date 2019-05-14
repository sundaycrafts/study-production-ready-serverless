'use strict';

require('dotenv').config()
const when = require('../steps/when')
const cheerio = require('cheerio')

describe('When we invoke the GET / endpoint', () => {
  it('Should return the index page with 8 restaurants', async () => {
    const {statusCode, headers, body} = await when.we_invoke_get_index()

    expect(statusCode).toEqual(200)
    expect(headers['content-type']).toEqual('text/html; charset=UTF-8')
    expect(body).not.toBeNull()

    const $ = cheerio.load(body)
    const restaurants = $('.restaurant', '#restaurantsUl')
    expect(restaurants.length).toEqual(8)
  })
})
