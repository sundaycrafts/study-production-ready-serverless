'use strict';

require('dotenv').config()
const when = require('../steps/when')
const init = require('../steps/init')

describe("When we invoke the POST /restaurants/search endpoint with theme 'cartoon'", () => {
  beforeAll(init)

  it('Should return an array of 4 restaurants', async () => {
    const {statusCode, body} = await when.we_invoke_search_restaurants('cartoon')

    expect(statusCode).toEqual(200)
    expect(body).toHaveLength(4)

    body.forEach(restaurant => {
      expect(restaurant).toHaveProperty('name')
      expect(restaurant).toHaveProperty('image')
    })
  })
})
