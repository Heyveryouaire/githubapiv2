//@ts-check
'use strict'

const fs = require('fs')
const path = require('path')
// const Errors = require('../lib/errors')

module.exports = (app, context) => {
  const middlewares = require('./middlewares/')(context)
  
  fs.readdirSync(path.join(__dirname))
    .filter(f => {
      const stat = fs.lstatSync(path.join(__dirname, f))
      return !stat.isDirectory() && f != "index.js"
    })
    .forEach(router => {
      const rootRoute = router.replace('.js', '')
      console.log("TCL: rootRoute", rootRoute)
      app.use(`/${rootRoute}`, require(path.join(__dirname, router))(context, middlewares))
    })

}
