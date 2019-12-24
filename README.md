# Boilerplate datastore API

## Intro

This project is a boilerplate to create an API with:
- Cloud DataStore : No SQL Dataabse
- Cloud Task      : Task scheduler

## Create env file
Copy paste config/dev/.env-example to config/dev/.env

Change env values.

## Google Service account
Create a service account on Google Cloud with role:
- Cloud Tasks Admin
- Cloud Trace Agent
- Cloud Datastore Owner
- Errors Writer
- Logging Admin

Download JSON credentials file, and save it to config/dev folder with name: dev-datastore-credentials.json

## Create a Google Cloud Task queue
To use the Cloud Task, you have to create a queue with:

```sh
npm run create-queue
```

## Encrypt/Decrypt data
To encrypt and decrypt data with asymetric method, you have to generate key pair for all environments with:

```sh
npm run bin/generate-keypair
```

## Models

To create a new model, create a new file in "src/db/models" (you can copy the example my-model.js).
It will be directly available when import db module in camelcase capitalize:
my-model.js -> MyModel
my-another-model -> MyAnotherModel

src/db/models/my-model.js
```js
const init = (gstore) => {
  const { createSchema /* , Schema */ } = require('../schema')(gstore)

  return createSchema(__filename, {
    astring: { type: String },
    aboolean: { type: Boolean, default: false },
    anumber: { type: Number, required: true },
    aday: { type: Date }
  })
}

module.exports = init
```

Access your models from anywhere you want:
```js
const { MyModel, MyAnotherModel } = require('../../db')(context.env.GCLOUD_PROJECT, context.env.GCLOUD_DATASTORE_NAMESPACE)
```

## Service

Context is an object. It has a env property, which is the env vars.

All services must have an index.js file, exporting a function that takes a context in paramater.

Each service can have a listener.
Just define a file in the service folder, named "listeners.js".
It must export a function taking "context" in parameter.

```js
//@ts-check
'use strict'

const { on, emit, emitAsync } = require('../../lib/pubsub')
// const CONSTANTS = require('../../lib/constants')

module.exports = (_context) => {

  // Create listener on "test-event".
  // Listener must return Object with success = false or true.
  // If success is false, and ecent was emmitted asynchronously (with Cloud Task), Task will be retried later.
  on("test-event", (payload) => {
    console.log('PAYLOAD', payload)
    return { success: true }
  })

  // Execute task with Cloud Task
  emitAsync(null, "test-event", { paramOne: "valueOne", "paramTwo": "valueTwo" })

  // Execute task with Promise.
  emit(null, "test-event", { paramOne: "valueOne", "paramTwo": "valueTwo" })
}

```

## Deploy

You can deploy on staging and/or production app engine application.

To deploy a staging version, just push to any branch.
To deploy to production, tag and push it.

The secret are managed with gitlab: https://gitlab.gpcsolutions.fr/devx/safir-api/settings/ci_cd "Environment variables" part
The value are base encoded 64. Example:

```sh
base64 config/production/.env
```

To decode a value, create a file with the variable value, and execute:

```sh
base64 -D <your_file>
```

The pipeline executes 3 steps:
- lint
- test
- deploy

Sometimes, fuc*** tests fail. You can just retry the step and pry.
You can also skip lint and deploy steps adding in the git commit comment:
- skip-lint   to skip lint
- skip-test   to skip test

## Generate key pair to encrypt data

Key pair is used to crypt password sending to external services.

To generate key pair for encryption, run:

```sh
npm run generate-keypair
```

You can generate keypair to specific environment: "test", "dev" or "production". Precise one to command like:

```sh
NODE_ENV=dev npm run generate-keypair
```

## Events emitter

### Local event

Lib pubsub.

You can emit events, and create some listeners on them.
You can declare one or many listeners on the same event.

If you want to retry your listener function if something went wrong in your lsitener, use emitAsync (it uses Google Cloud Task).
Be carefull, you can't get the result of your async emitter when Cloud Task is called. It lust be used to do some async job.

You can declare a event in constants lib in EVENTS:

```js
const EVENTS = {
...
MY_EVENT: "MY_EVENT",
...
```
You can define a listener with "on" function:

```js
const { on, EVENTS } = require ('./src/lib/pubsub')

on(EVENTS.MY_EVENT, (payload) => {
  console.log('your function', payload)
})
```

Then, you can emit your event:

```js
const { emit, EVENTS } = require ('./src/lib/pubsub')

emit(<user_id || null>, EVENTS.MY_EVENT, { <your_payload> })
```

### Cloud task event

Before emit Cloud Task event, you have to create a queue in your google cloud project.
For development environment, you have to start a specific app engine to redirect Cloud Task to your app.

##### (DEV) Create the reverse proxy app

```sh
git clone git@gitlab.com:caralliance/tasks-reverse-proxy.git
cd tasks-reverse-proxy
gcloud config set project busexchange
gcloud app deploy
```

#### Create the Cloud queue

Enable Cloud task API on GCP (https://console.cloud.google.com/apis/library/cloudtasks.googleapis.com), App Engine Admin API, DNS reader.
Your credentials may have Cloud Tasks Admin permissions.

```
NODE_ENV=dev node bin/create-queue.js
```

Be sure you put tasks-reverse-proxy` to AppEngine service.

Example of prompt answers:
prompt: Google Project id:  (busexchange)
prompt: Queue name:  queue-dev
prompt: Google Project location:  (europe-west1)
prompt: AppEngine service:  (default) tasks-reverse-proxy


You can use Cloud task to execute events. You can also schedule them:

```js
const { emitAsync, EVENTS } = require ('./src/lib/pubsub')

emitAsync(<user_id || null>, EVENTS.MY_EVENT, { <your_payload> }, )

```

emitAsync must return an object, with success property.

If success is false, the cloud tak will be called again later.
