//@ts-check
'use strict'

// const UserUtils = require('../../lib/user-utils')

const init = (gstore) => {
  const { createSchema } = require('../schema')(gstore)

  return createSchema(__filename,
    {
      firstname: { type: String, required: true },
      email: { type: String, validate: 'isEmail', required: true },
      password: { type: String, read: false, required: true },

      lastname: { type: String, optional: true },
      phone: { type: String, optional: true },

      token: { type: String, optional: true, read: false },

      roles: { type: Array, default: [] },

      params: { type: Object, default: {} }
    })
}

module.exports = init
