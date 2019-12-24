//@ts-check
'use strict'

describe("Router users tests", () => {

  const path = require('path')

  const faker = require('faker')
  faker.locale = "fr";

  require('dotenv').config({
    path: path.join(__dirname, '../../../../config/test/.env')
  })

  const { getValidUser, getRandomUser } = require('../../lib/test')

  const request = require('supertest')
  const app = require('../../index')
  const CONSTANTS = require('../../lib/constants')

  const Models = require('../../db')(process.env.GCLOUD_PROJECT, process.env.GCLOUD_DATASTORE_NAMESPACE)
  const User = Models.User
  // const context = createContext()
  // createKeyPair()

  // beforeAll(async () => {
  //   // await Promise.all(Object.values(Models).map(Model => Model.deleteAll()))
  //   const { createDefaultNotifTemplate } = require('../../services/notificationService/index')(context)
  //   await createDefaultNotifTemplate()
  // })

  // beforeAll(async () => {
  //   await startDatastoreEmulator()
  // })

  // afterAll(async () => {
  //   await stopDatastoreEmulator()
  // })

  it("Bad create user with no post body", () => {
    return new Promise(resolve => {
      request(app)
        .post('/users')
        // .send({name: 'john'})
        .expect(400)
        .end(function (err, _res) {
          if (err) throw err;
          resolve()
        });
    })
  })

  it("Bad create user with bad data", () => {
    return new Promise(resolve => {
      request(app)
        .post('/users')
        .send({
          email: "gael@email.com",
          lastname: "philippe",
          phone: "09989786845",
          password: "password"
        })
        .expect(400)
        .end(function (err, _res) {
          if (err) throw err;
          resolve()
        });
    })
  })

  it("Create user with same email", () => {
    const newUserParams = getRandomUser()

    return new Promise(resolve => {
      request(app)
        .post('/users')
        .send(newUserParams)
        .expect(201)
        .end(function (err, _res) {
          if (err) throw err;

          request(app)
            .post('/users')
            .send(newUserParams)
            .expect(409)
            .end(function (err, _res) {
              if (err) throw err;

              resolve()
            })
        })
    })
  })

  it("Create user with same phone", () => {
    const newUserParams = getRandomUser()

    return new Promise(resolve => {
      request(app)
        .post('/users')
        .send(newUserParams)
        .expect(201)
        .end(function (err, _res) {
          if (err) throw err;

          newUserParams.email = "another@email.com"

          request(app)
            .post('/users')
            .send(newUserParams)
            .expect(409)
            .end(function (err, _res) {
              if (err) throw err;

              resolve()
            })
        })
    })
  })

  it("Good create user", () => {
    const newUserParams = getRandomUser()

    return new Promise(resolve => {
      request(app)
        .post('/users')
        .send(newUserParams)
        .expect(201)
        .end(function (err, res) {
          if (err) throw err;

          expect(err).toBeNull()
          expect(res).not.toBeNull()

          expect(res.body).toHaveProperty("tokens")
          expect(res.body.tokens).toHaveProperty("token")
          expect(res.body.tokens).toHaveProperty("refreshtoken")
          expect(res.body.lastname).toEqual(newUserParams.lastname)

          resolve()
        });
    })
  })

  it("Bad login user with empty body", () => {
    return new Promise(resolve => {
      request(app)
        .post('/users/login')
        // .send({name: 'john'})
        .expect(400)
        .end(function (err, _res) {
          if (err) throw err;
          resolve()
        });
    })
  })

  it("Bad login user with bad user infos", () => {
    return new Promise(resolve => {
      request(app)
        .post('/users/login')
        .send({ email: 'john@jonh.com', password: "password" })
        .expect(404)
        .end(function (err, _res) {
          if (err) throw err;
          resolve()
        });
    })
  })

  // it("Good login user, but email not validated", () => {
  //   const newUserParams = getRandomUser()

  //   return new Promise(resolve => {
  //     request(app)
  //       .post('/users')
  //       .send(newUserParams)
  //       .expect(201)
  //       .end(function (e, r) {
  //         if (e) throw e;

  //         request(app)
  //           .post('/users/login')
  //           .send({ email: newUserParams.email, password: newUserParams.password })
  //           .expect(401)
  //           .end(function (err, _res) {
  //             if (err) throw err;
  //             resolve()
  //           });
  //       })
  //   })
  // })

  it("Good login user, with validated email", async () => {
    const validUser = await getValidUser()

    return new Promise(resolve => {
      request(app)
        .post(`/users/login`)
        .send({ email: validUser.email, password: validUser.password })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;

          expect(res.body).toHaveProperty("tokens")
          expect(res.body.tokens).toHaveProperty("token")
          expect(res.body.tokens).toHaveProperty("refreshtoken")
          resolve()
        });
    })
  })

  it("Create user, validate email with bad token", () => {
    const newUserParams = getRandomUser()

    return new Promise(resolve => {
      request(app)
        .post('/users')
        .send(newUserParams)
        .expect(201)
        .end(async function (e, _r) {
          if (e) throw e;

          request(app)
            .get(`/users/validate-email/token`)
            .expect(404)
            .end(function (err, _res) {
              if (err) throw err;
              resolve()
            });
        })
    })
  })

  it("Create user, validate email with bad token", () => {
    const newUserParams = getRandomUser()

    return new Promise(resolve => {
      request(app)
        .post('/users')
        .send(newUserParams)
        .expect(201)
        .end(async function (e, r) {
          if (e) throw e;

          const { token } = await User.get(r.body.id, { readAll: true, select: 'token' })

          request(app)
            .get(`/users/validate-email/${token}`)
            .expect(200)
            .end(function (err, _res) {
              if (err) throw err;
              resolve()
            });
        })
    })
  })

  it("Add Role with no user in query", async () => {
    return new Promise(resolve => {
      request(app)
        .post('/users/add-role')
        .expect(401)
        .end(async function (e, _r) {
          if (e) throw e;
          resolve()
        })
    })
  })

  it("Add Role with no role in body", async () => {
    const user = await getValidUser()

    return new Promise(resolve => {
      request(app)
        .post('/users/add-role')
        .set('authorization', `Bearer ${user.jwt.token}`)
        .expect(400)
        .end(async function (e, _r) {
          if (e) throw e;
          resolve()
        })
    })
  })

  it("Add Role with bad role in body", async () => {
    const user = await getValidUser()

    return new Promise(resolve => {
      request(app)
        .post('/users/add-role')
        .set('authorization', `Bearer ${user.jwt.token}`)
        .send({ role: "Bad role" })
        .expect(400)
        .end(async function (e, _r) {
          if (e) throw e;
          resolve()
        })
    })
  })

  it("Add Role with good role in body", async () => {
    const user = await getValidUser()

    return new Promise(resolve => {
      request(app)
        .post('/users/add-role')
        .set('authorization', `Bearer ${user.jwt.token}`)
        .send({ role: CONSTANTS.ROLES.USER_EXT })
        .expect(202)
        .end(async function (e, r) {
          if (e) throw e;

          const userUpdated = await User.get(r.body.id)
          expect(Array.isArray(userUpdated.roles)).toBeTruthy()
          expect(userUpdated.roles.length).toEqual(2)
          expect(userUpdated.roles).toContain(CONSTANTS.ROLES.USER_EXT)
          expect(userUpdated.roles).toContain(CONSTANTS.ROLES.USER)
          resolve()
        })
    })
  })

})
