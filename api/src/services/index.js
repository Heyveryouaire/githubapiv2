//@ts-check
'use strict'

const fs = require('fs')
const path = require('path')

/**
 * Require all services index.js files
 * @param {*} context 
 */
const init = (context) => {
  const services = {}

  // Get all index.js file of all service directories
  const serviceFiles = fs.readdirSync(__dirname)
    .filter(f => {
      const stat = fs.lstatSync(path.join(__dirname, f))
      return stat.isDirectory()
    })

  // Require all index.js files
  serviceFiles.forEach(service => {
    services[service] = require(path.join(__dirname, service, 'index'))(context)
    
    // Require listener file if exists.
    if (fs.existsSync(path.join(__dirname, service, 'listeners.js'))) {
      require(path.join(__dirname, service, 'listeners'))(context)
    }
  })

  return services
}

module.exports = init
