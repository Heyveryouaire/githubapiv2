//@ts-check
'use strict'

const router = require('express').Router()

const { emit } = require('../lib/pubsub')

module.exports = (_context, _middlewares) => {

  // const { User } = require('../db')(context)

  router.post('/', async (req, res, next) => {
    try {
      let bodyJson = req.body

      try {
        bodyJson = JSON.parse(req.body.toString())
      } catch (err) {
        console.error(err)
      }

      const { eventName, payload, userId } = bodyJson
      const eventResults = await emit(userId, eventName, payload)

      let isEventKO = eventResults.find(eventRes => eventRes && !eventRes.success)

      if (isEventKO) {
        res.status(500).send()
      } else {
        res.status(201).send()
      }
    } catch (err) {
      console.error(err)
      err.statusCode = err.statusCode || 500
      next(err)
    }
  })

  return router
}
