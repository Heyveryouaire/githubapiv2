
//@ts-check
'use strict'

if (process.env.NODE_ENV == "production") {
  require('@google-cloud/trace-agent').start()
  require('@google-cloud/debug-agent').start()
}

const listenPort = process.env.PORT || 3000

process.env.PORT = listenPort

// Import .env
// Don't forget to create .env file at root.
const path = require('path')

require('dotenv').config({
  path: path.join(__dirname, `/config/.env`)
})

process.env.TZ = "Europe/Paris"

if (process.env.NODE_ENV != "production") {
  // process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS_FILE)
}

if (process.env.NODE_ENV == "production") {
  require('@google-cloud/profiler').start({
    serviceContext: {
      service: 'safir-api'
    }
  })
}

const app = require('./src')

// Need to change
const logger = console

// const logWinston = require('./src/lib/log/winston-log')
// app.use(logWinston.requestLogger)

app.listen(listenPort, () => {
  logger.log("App listening on ", listenPort)
})

// Not add swagger in production env.
if (process.env.NODE_ENV != "production") {
  const swaggerJSDoc = require('swagger-jsdoc');

  // swagger definition
  var swaggerDefinition = {
    info: {
      title: 'Safir API',
      version: '1.0.0',
      description: 'Safir API',
    },
    host: 'localhost:3000',
    basePath: '/',
    securityDefinitions: {
      auth: {
        type: 'apiKey',
        name: 'Authorization'
      }
    },
    security: [
      { auth: [] }
    ]
  };

  // options for swagger jsdoc 
  var options = {
    swaggerDefinition: swaggerDefinition, // swagger definition
    apis: [
      './src/routes/users.js',
      './src/routes/drivers.js',
      './src/routes/directions.js',
      './src/routes/bookings.js',
      './src/routes/rides.js',
      './src/routes/gescar-import.js',
      './src/routes/regular-lines.js',
      './src/routes/bus-stops.js',
      './src/routes/places.js',
      './src/routes/notifs.js',
    ], // path where API specification are written
  };

  // initialize swaggerJSDoc
  var swaggerSpec = swaggerJSDoc(options);



//   const { inspect } = require('util')

//   // const Models = require(path.join(__dirname, '/src/db'))(process.env.GCLOUD_PROJECT, process.env.GCLOUD_DATASTORE_NAMESPACE)

//   const fs = require('fs')

//   fs.readdirSync(path.join(__dirname, '/src/db/models'))
//     .filter(model => {
//       if (!model.includes('spec')) {
//         model = model.replace('.js', '')

//         const ModelSchema = Object.keys(Models).find(m => {
//           // console.log(m.toLowerCase(), model.replace('-',''))
//           return m.toLowerCase() == model.replace('-', '')
//         })

//         const fields = Models[ModelSchema].schema.paths

//         swaggerSpec.paths['/' + model + 's'] = {
//           post: {
//             tags: [model],
//             produces: ['application/json'],
//             consumes: ['application/json'],

//             "parameters": [
//               {
//                 "in": "body",
//                 "name": `${model}`,
//                 "description": `${model} infos`,
//                 "schema": {
//                   "type": "object",
//                   "required": Object.keys(fields).filter(field => fields[field].required),
//                   "properties": Object.keys(fields).reduce((acc, field) => {

//                     //                  try {
//                     if (fields[field].type && typeof fields[field].type != "undefined" && fields[field].type.name) {
//                       const funcName = inspect(fields[field].type.name).toLowerCase().replace(/'/g, '')

//                       if (["undefined", "date", "entityKey"].includes(funcName)) {
//                         acc[field] = { type: "string" }
//                       } else {
//                         acc[field] = { type: funcName }
//                       }
//                       //
//                     }

//                     // } catch (err) {
//                     //   //
//                     // }

//                     return acc
//                   }, {}),
//                 }
//               }
//             ],
//             responses: { '201': { "description": `Return ${model}` } }
//           },
//           get: {
//             tags: [model],
//             produces: ['application/json'],
//             consumes: ['application/json'],
//             responses: { '200': { "description": `List of ${model}s` } }
//           }
//         }
//         swaggerSpec.paths['/' + model + 's/{id}'] = {
//           "get": {
//             tags: [model],
//             "description": `Return ${model} by id`,
//             "produces": [
//               "application/json"
//             ],
//             "parameters": [
//               {
//                 "name": "id",
//                 "description": `${model} id`,
//                 "in": "path",
//                 "required": true,
//                 "schema": {
//                   "type": "string"
//                 }
//               }
//             ],
//             "responses": {
//               "200": {
//                 "description": `Return ${model}`
//               }
//             }
//           },

//           "delete": {
//             tags: [model],
//             "description": `Delete ${model} by id`,
//             "produces": [
//               "application/json"
//             ],
//             "parameters": [
//               {
//                 "name": "id",
//                 "description": `${model} id`,
//                 "in": "path",
//                 "required": true,
//                 "schema": {
//                   "type": "string"
//                 }
//               }
//             ],
//             "responses": {
//               "200": {
//                 "description": `Return OK`
//               }
//             }
//           },
//           patch: {
//             tags: [model],
//             produces: ['application/json'],
//             consumes: ['application/json'],

//             "parameters": [
//               {
//                 "in": "body",
//                 "name": `${model}`,
//                 "description": `${model} infos`,
//                 "schema": {
//                   "type": "object",
//                   "properties": Object.keys(fields).reduce((acc, field) => {

//                     //                  try {
//                     if (fields[field].type && typeof fields[field].type != "undefined" && fields[field].type.name) {
//                       const funcName = inspect(fields[field].type.name).toLowerCase().replace(/'/g, '')

//                       if (["undefined", "date", "entityKey"].includes(funcName)) {
//                         acc[field] = { type: "string" }
//                       } else {
//                         acc[field] = { type: funcName }
//                       }
//                       //
//                     }

//                     return acc
//                   }, {}),
//                 }
//               }
//             ],
//             responses: { '201': { "description": `Return ${model}` } }
//           }

//         }
//       }
//     })

//   // route for swagger.json
//   app.get('/swagger.json', function (req, res) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.setHeader('Content-Type', 'application/json');
//     res.send(swaggerSpec);
//   });
}


process.on('unhandledRejection', (err) => {
  logger.error(err)
});
