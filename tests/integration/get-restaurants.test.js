'use strict';

require('dotenv').config()
const when = require('../steps/when')

describe('When we invoke the GET /restaurants endpoint', () => {
  it('Should return an array of 8 restaurants', async () => {
    const {statusCode, body} = await when.we_invoke_get_restaurants()

    expect(statusCode).toEqual(200)
    expect(body).toHaveLength(8)

    body.forEach(restaurant => {
      expect(restaurant).toHaveProperty('name')
      expect(restaurant).toHaveProperty('image')
    })
  })
})
