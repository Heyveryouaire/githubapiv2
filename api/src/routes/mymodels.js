//@ts-check
'use strict'

const router = require('express').Router()

module.exports = (context, _middlewares) => {
  // const { MyModel } = require('../db')(context.env.GCLOUD_PROJECT, process.env.GCLOUD_DATASTORE_NAMESPACE)

  // // Need to be declared after router routes declaration to not override them.
  // const crudRouter = require('../lib/router/crud')(context, router, MyModel, {

  //   // You can add checking writes middlewares.
  //   // list: [_middlewares.isAuthenticated],

  //   // You can use them as a trigger (executed before the crud router),
  //   // to validate some fields, ...
  //   // update: (req, _res, next) => {
  //   //   req.body.holidays = { start: new Date() }
  //   //   next()
  //   // },
  // })

  return router
}
