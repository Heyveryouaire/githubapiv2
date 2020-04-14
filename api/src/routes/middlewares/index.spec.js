//@ts-check
'use strict'

describe("Auth test", () => {
  const path = require('path')

  require('dotenv').config({
    path: path.join(__dirname, '../../../config/test/.env')
  })

  const { createContext, getValidUser } = require('../../lib/test')

  const context = createContext()

  // const jwt = require('../../lib/jwt')(context)
  const middlewares = require('./index')(context)

  const request = require('supertest');
  const app = require('../../index')

  const bearerToken = require('express-bearer-token')


  // Prepare test routes
  app.get('/free-route', async (req, res, _next) => {
    res.send()
  })

  app.get('/is-authenticated', middlewares.isAuthenticated, (req, res, _next) => { res.send() })
  app.get('/parse-user', middlewares.parseUser, function (req, res, _next) { res.send() })
  app.get('/is-email-validated', middlewares.isEmailValidated, (req, res, _next) => { res.send() })
  app.get('/has-safran-user-role', middlewares.hasRole("Safran-User"), (req, res, _next) => { res.send() })
  app.get('/throw-an-error', async (_req, _res, _next) => {
    throw new Error('En arror')
  })

  it("Clean tokens in header", async () => {
    const { jwt: { token } } = await getValidUser()

    const req = {
      headers: { "authorization": `Bearer ${token}` }
    }

    return new Promise(resolve => {
      // eslint-disable-next-line
      bearerToken()(req, null, () => {
        middlewares.parseUser(req, null, () => {
          expect(req.hasOwnProperty('user')).toBeTruthy()
          expect(req.user).not.toBeUndefined()
          resolve()
        })
      })
    })
  })

  it("Mal formatted token in header tokens", () => {
    const req = {
      headers: { "authorization": "Bearer trucdemerde" }
    }

    return new Promise(resolve => {
      // eslint-disable-next-line
      bearerToken()(req, null, () => {
        middlewares.parseUser(req, null, () => {
          expect(req.hasOwnProperty('user')).toBeFalsy()
          resolve()
        })
      })

    })
  })

  it("Empty header token", () => {
    const req = {
      headers: {}
    }

    return new Promise(resolve => {
      // eslint-disable-next-line
      bearerToken()(req, null, () => {
        middlewares.parseUser(req, null, () => {
          expect(req.hasOwnProperty('user')).toBeFalsy()
          resolve()
        })
      })
    })
  })

  it("test no middlewares", () => {
    return new Promise(resolve => {
      request(app)
        .get('/free-route')
        .expect(200)
        .end(function (err, _res) {
          if (err) throw err;
          resolve()
        });
    })
  })

  it("/parse-user with no user", () => {
    return new Promise(resolve => {
      request(app)
        .get('/parse-user')
        .expect(200)
        .end(function (err, response) {
          if (err) throw err;
          expect(response.header.user).toBeUndefined()
          resolve()
        });
    })
  })

  it("/is-authenticated 401", () => {
    return new Promise(resolve => {
      request(app)
        .get('/is-authenticated')
        .expect(401)
        .end(function (err, _res) {
          if (err) throw err;
          resolve()
        });
    })
  })

  it("/is-authenticated 200", async () => {
    const { jwt: { token } } = await getValidUser()

    return new Promise(resolve => {
      request(app)
        .get('/is-authenticated')
        .set("authorization", `Bearer ${token}`)
        .expect(200)
        .end(function (err, _response) {
          if (err) throw err;
          resolve()
        });
    })
  })

  it("/is-email-validated 401 with no user", () => {
    return new Promise(resolve => {
      request(app)
        .get('/is-email-validated')
        .expect(401)
        .end(function (err, _res) {
          if (err) throw err;
          resolve()
        });
    })
  })

  // it("/is-email-validated 401 with good user but email not validated", async () => {
  //   const { jwt: { token } } = await getValidUser()

  //   return new Promise(resolve => {
  //     request(app)
  //       .get('/is-email-validated')
  //       .set("authorization", `Bearer ${token}`)
  //       .expect(200)
  //       .end(function (err, response) {
  //         if (err) throw err;
  //         resolve()
  //       });
  //   })
  // })

  it("/has-safran-user-role 401 with no user", () => {
    return new Promise(resolve => {
      request(app)
        .get('/has-safran-user-role')
        .expect(401)
        .end(function (err, _response) {
          if (err) throw err;
          resolve()
        });
    })
  })

  it("/has-safran-user-role 401 with user with no admin role", async () => {
    const { jwt: { token } } = await getValidUser()

    return new Promise(async resolve => {
      request(app)
        .get('/has-safran-user-role')
        .set("Authorization", `Bearer ${token}`)
        .expect(401)
        .end(function (err, _response) {
          if (err) throw err;
          resolve()
        });
    })
  })

  it("/has-safran-user-role 401 with user with admin role", async () => {
    const { jwt: { token } } = await getValidUser({ roles: ["Safran-User"] })

    return new Promise(async resolve => {
      request(app)
        .get('/has-safran-user-role')
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .end(function (err, _response) {
          if (err) throw err;
          resolve()
        });
    })
  })


})
