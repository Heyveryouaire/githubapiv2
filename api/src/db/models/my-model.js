//@ts-check
'use strict'

// const moment = require('moment')

// const CONSTANTS = require('../../lib/constants')
// const { getMidnightDate } = require('../../lib/date')

const init = (gstore) => {
  const { createSchema, /* Schema */ } = require('../schema')(gstore)

  return createSchema(__filename, {

    astring: { type: String },
    aboolean: { type: Boolean, default: false },
    anumber: { type: Number, required: true },
    aday: { type: Date },

    // amodel: { type: Schema.Types.Key, ref: 'User', required: true },
  },
    // {
    //   pre: {
    // async delete() {
    // },
    //     async save() {
    //       this.day = getMidnightDate(this.departure_time)
    //       this.before13h = moment(this.departure_time).subtract(1, "days").set({ hour: 13, minutes: 0 }).isSameOrAfter(moment())
    //     },
    //     async findOne(args) {
    //       if (args.departure_time) {
    //         args.day = getMidnightDate(args.departure_time)
    //       }

    //       return args
    //     },
    //   }
    // }
  )
}

module.exports = init
