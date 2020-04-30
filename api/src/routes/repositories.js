//@ts-check
'use strict'

const router = require('express').Router()

module.exports = (context, _middlewares) => {
  const {
    Models: { Repository }
  } = require("../db-postgresql")(context.env)

  // // Need to be declared after router routes declaration to not override them.
  const crudRouter = require('../lib/router/crud-pg')(context, router, Repository, {

  //   // You can add checking writes middlewares.
    list: [],

  //   // You can use them as a trigger (executed before the crud router),
  //   // to validate some fields, ...
  //   // update: (req, _res, next) => {
  //   //   req.body.holidays = { start: new Date() }
  //   //   next()
  //   // },
  })

  return crudRouter
}
