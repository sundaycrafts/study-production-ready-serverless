'use strict';

require('dotenv').config()
const when = require('../steps/when')
const given = require('../steps/given')
const tearDown = require('../steps/tearDown')

describe("Given an authenticated user", () => {
  let user
  beforeAll(async () => {
    user = await given.an_authenticated_user()
  })
  afterAll(() => tearDown.an_authenticated_user(user.username))

  describe("When we invoke the POST /restaurants/search endpoint with theme 'cartoon'", () => {
    it('Should return an array of 4 restaurants', async () => {
      const {statusCode, body} = await when.we_invoke_search_restaurants(user.idToken, 'cartoon')

      expect(statusCode).toEqual(200)
      expect(body).toHaveLength(4)

      body.forEach(restaurant => {
        expect(restaurant).toHaveProperty('name')
        expect(restaurant).toHaveProperty('image')
      })
    })
  })
})
