const path = require('path')

require('dotenv').config({
  path: path.join(__dirname, `/../config/${process.env.NODE_ENV ? process.env.NODE_ENV : "dev"}/.env`)
})

const { createQueue } = require('../src/lib/task')

const prompt = require('prompt')

const schema =
  [{
    name: 'gcloud_project',
    description: 'Google Project id',     // Prompt displayed to the user. If not supplied name will be used.
    type: 'string',                 // Specify the type of input to expect.
    default: process.env.GCLOUD_PROJECT,             // Default value to use if no value is entered.
    required: true,                        // If true, value entered must be non-empty.
  },
  {
    name: 'queue_name',
    description: 'Queue name',     // Prompt displayed to the user. If not supplied name will be used.
    type: 'string',                 // Specify the type of input to expect.
    required: true,                        // If true, value entered must be non-empty.
  },
  {
    name: 'google_project_location',
    description: 'Google Project location',     // Prompt displayed to the user. If not supplied name will be used.
    type: 'string',                 // Specify the type of input to expect.
    default: process.env.GCLOUD_LOCATION,             // Default value to use if no value is entered.
    required: true,                        // If true, value entered must be non-empty.
  },
  {
    name: 'google_appengine_service',
    description: 'AppEngine service',     // Prompt displayed to the user. If not supplied name will be used.
    type: 'string',                 // Specify the type of input to expect.
    default: 'default',             // Default value to use if no value is entered.
    required: true,                        // If true, value entered must be non-empty.
  }]

prompt.start();

prompt.get(schema, async function (err, result) {
  result.queue_name = result.queue_name.replace(/ /g, '-')

  console.log(result)

  const res = await createQueue(result.gcloud_project, // Your GCP Project id
    result.queue_name, // Name of the Queue to create
    result.google_project_location, // The GCP region in which to create the queue
    result.google_appengine_service)

  console.log(res)
})
