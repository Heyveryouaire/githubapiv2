//@ts-check
'use strict'

// Need to change
const app = require('express')()
const bodyParser = require('body-parser')
const domain = require('domain')
const bearerToken = require('express-bearer-token')

console.log(bearerToken);


app.use(bodyParser.raw());
app.use(bodyParser.json());
app.use(bodyParser.text());

app.use(function (req, res, next) {

  var reqDomain = domain.create();
  reqDomain.add(req);
  reqDomain.add(res);
  reqDomain.on('error', function (err) {
    next(err)
  });

  reqDomain.run(() => next());
});
app.use(bearerToken())

app.use('/*', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization'); // If needed
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count'); // If needed
  res.setHeader('Access-Control-Allow-Credentials', "true"); // If needed
  next()
});

const context = {
  env: process.env
}

// Create all routes.
require('./routes')(app, context)

app.use((err, _req, res, _next) => {
  res.status(err.statusCode || 500)

  console.error(err)

  if (err.name == "GstoreError") {
    res.send('Elément non trouvé')
  } else if (err.statusCode != 500) {
    res.send(err.message)
  } else {
    res.send("Une erreur est survenue")
  }
});

(
  async () => {
  //   if (process.env.NODE_ENV == "dev") {
      // const ngrok = require('ngrok');

  //     // Kill old process ngrok.
  //     // With hot code reloading, ngrok process isn't killed.
  //     try {
  //       require('child_process').execSync('pkill ngrok');
  //     } catch (_err) {
  //       //
  //     }

  //     process.env.NGROK_URL = await ngrok.connect(process.env.PORT)
  //   }

    require('./services')(context)
  }
)
();

// Init all context with listeners

module.exports = app
