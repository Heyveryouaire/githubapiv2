//@ts-check
'use strict'

const init = (gstore) => {
  const { createSchema, Schema } = require('../schema')(gstore)

  return createSchema(__filename, {
    name: { type: String, required: true },
    user: { type: Schema.Types.Key, ref: 'User' },
    payload: { type: Object }
  })
}

module.exports = init
