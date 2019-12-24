//@ts-check
'use strict'

const path = require('path')

require('dotenv').config({
  path: path.join(__dirname, '../../../config/test/.env')
})

// const DatastoreEmulator = require('google-datastore-emulator')
const { encode } = require('../crypt')("test")
const { createAndWriteKeyPair } = require('../crypt')("test")
const randomstring = require("randomstring")

// const CONSTANTS = require('../constants')

createAndWriteKeyPair()

process.env.GCLOUD_DATASTORE_NAMESPACE = randomstring.generate(7) + "_" + new Date().getTime()

const createContext = () => {
  return {
    env: process.env
  }
}

// const { createSearch } = require('../../services/directionService')(createContext())
// const { createBooking } = require('../../services/bookingService')(createContext(), false)

// const _startDatastoreEmulator = async (emulator) => {
//   emulator = new DatastoreEmulator()
//   await emulator.start()
//   return emulator
// }

// const _stopDatastoreEmulator = (emulator) => {
//   return emulator.stop()
// }

const faker = require('faker')
faker.locale = "fr";

const getRandomUser = () => ({
  email: `${randomstring.generate(7)}_${faker.internet.email()}`,
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  phone: `06${Math.floor(Math.random() * 99999999) + 10000000}`,

  password: "password",
  externalServices: [{
    service: "TAD",
    params: { token: encode("token") }
  }]
})

const getValidUser = (UserService, User, params = {}) => {
  return new Promise(async resolve => {
    let userParams = getRandomUser()

    userParams = { ...userParams, ...params }

    const { id } = await UserService.createUser(userParams)
    const { token } = await User.get(id, { readAll: true, select: 'token' })
    await UserService.validateEmail(token)

    const tokens = UserService.generateJWTTokens(id)

    userParams.id = id
    userParams.jwt = tokens

    // setTimeout(() => {
    resolve(userParams)
    // }, 100)
  })
}

const getValidUserEntity = async (UserService, User, params = {}) => {
  return new Promise(async resolve => {
    let userParams = getRandomUser()

    userParams = { ...userParams, ...params }

    const { id } = await UserService.createUser(userParams)
    const { token } = await User.get(id, { readAll: true, select: 'token' })
    await UserService.validateEmail(token)
    const user = await User.get(id, { readAll: true, select: 'token' })

    user.jwt = UserService.generateJWTTokens(id)
    // return user

    // setTimeout(() => {
    resolve(user)
    // }, 100)
  })
}

// const getUserBookings = (Booking, user) => {
//   return Booking.listBy({ user: user.entityKey })
// }

// const _getFullDriverEntity = async (UserService, User, role = CONSTANTS.ROLES.DRIVER_TAD) => {
//   let driverParams = getRandomUser()

//   driverParams.role = role


//   const driver = await UserService.createDriver(driverParams)
//   return User.get(driver.id)
// }



// const getFullUserEntity = (UserService, User, params = {}) => {
//   return new Promise(async resolve => {
//     const user = await getValidUserEntity(UserService, User, params)

//     await createSearch(user, {
//       datetimes: [new Date()],
//       departure_position: { address: "address 2" },
//       arrival_position: { address: "address" },
//       requested_seats: 1,
//       time_restriction_type: "ARRIVAL"
//     })

//     const reservation = {
//       service: CONSTANTS.SERVICES.FIXE,
//       service_id: "12",
//       search_id: "12_12",
//       external_id: "12",
//       duration: 20,
//       departure_time: new Date(),
//       arrival_time: new Date(),
//       departure_position: { address: "address", lat: 47.893175398729, lon: 2.02710025012493 },
//       arrival_position: { address: "address", lat: 47.9197933949673, lon: 1.98698039999999 },
//       user: user.entityKey,
//       requested_seats: 1,
//       params: { pmr: false, bicycle: false },
//       travel: [
//         {
//           "transport": "Walking",
//           "color": "red",
//           "duration": 5,
//           "departure_time": new Date(),
//           "arrival_time": new Date(),
//           "departure_position": { address: "address", lat: 47.893175398729, lon: 2.02710025012493 },
//           "arrival_position": { address: "address", lat: 47.893175398729, lon: 2.02710025012493 },
//           "params": {}
//         },

//         {
//           "transport": "vehicule",
//           "service": "TAD",
//           "service_id": "25",
//           "color": "blue",
//           "bus_stop_id": "bus_stop_id",
//           "duration": 10,
//           "departure_time": new Date(),
//           "arrival_time": new Date(),
//           "departure_position": { address: "address", lat: 47.893175398729, lon: 2.02710025012493 },
//           "arrival_position": { address: "address", lat: 47.9197933949673, lon: 1.98698039999999 },
//           "params": {
//             "name": "TAD",
//             "short_name": "TAD",
//           }
//         },

//         {
//           "transport": "Walking",
//           "color": "red",
//           "duration": 5,
//           "departure_time": new Date(),
//           "arrival_time": new Date(),
//           "departure_position": { address: "address", lat: 47.9197933949673, lon: 1.98698039999999 },
//           "arrival_position": { address: "address", lat: 47.9197933949673, lon: 1.98698039999999 },
//           "params": {}
//         }
//       ]
//     }

//     const booking = await createBooking(user, reservation)
//     user.booking = booking

//     setTimeout(() => {

//       resolve(user)

//     }, 500)
//   })
// }

// const getUserWithEmailNotValidated = async (UserService) => {
//   const userParams = getRandomUser()

//   const { id } = await UserService.createUser(userParams)
//   userParams.id = id

//   return userParams
// }

// const createRegularBusLines = (importFile) => {
//   // return importFile(path.join(__dirname, '../../../config/test/regular-lines.xlsx'))
//   return importFile(path.join(__dirname, '../../../config/test/simple-lines.xlsx'))
// }


const init = () => {
  const context = createContext()

  const UserService = require('../../services/userService')(context)
  const Models = require('../../db')(process.env.GCLOUD_PROJECT, process.env.GCLOUD_DATASTORE_NAMESPACE)
  // const { importFile } = require('../../services/regularLineService')(context)

  // beforeAll(async () => {
  //   return Promise.all(Object.entries(Models).map(Model => Model.deleteAll()))
  // })
  // let emulator



  return {
    createContext,
    // startDatastoreEmulator: async () => {
    //   emulator = await _startDatastoreEmulator(emulator)
    // },
    // stopDatastoreEmulator: () => {
    //   let res

    //   return new Promise(async resolve => {
    //     try {
    //       res = await _stopDatastoreEmulator(emulator)
    //     } catch (e) {
    //       console.error(e)
    //     } finally {
    //       setTimeout(() => {
    //         resolve(res)
    //       }, 1000)
    //     }
    //   })
    // },
    createKeyPair: createAndWriteKeyPair,
    getValidUser: (params) => getValidUser(UserService, Models.User, params),
    getValidUserEntity: (params) => getValidUserEntity(UserService, Models.User, params),
    // getFullUserEntity: (params) => getFullUserEntity(UserService, Models.User, params),
    // getUserBookings: (user) => getUserBookings(Models.Booking, user),
    // getUserWithEmailNotValidated: () => getUserWithEmailNotValidated(UserService),
    getRandomUser,
    // createRegularBusLines: () => createRegularBusLines(importFile),
    // getFullDriverEntity: () => _getFullDriverEntity(UserService, Models.User)
  }

}

module.exports = init()
