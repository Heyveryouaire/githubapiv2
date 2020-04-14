const cloudTasks = require('@google-cloud/tasks');
const moment = require('moment');

async function createQueue(
  project = 'my-project-id', // Your GCP Project id
  queue = 'my-appengine-queue', // Name of the Queue to create
  location = 'europe-west1', // The GCP region in which to create the queue
  service = 'default'
) {
  // Imports the Google Cloud Tasks library.
  // const cloudTasks = require('@google-cloud/tasks')

  // Instantiates a client.
  const client = new cloudTasks.CloudTasksClient()

  // Send create queue request.
  const [response] = await client.createQueue({
    // The fully qualified path to the location where the queue is created
    parent: client.locationPath(project, location),
    queue: {
      // The fully qualified path to the queue
      name: client.queuePath(project, location, queue),
      appEngineHttpQueue: {
        appEngineRoutingOverride: {
          // The App Engine service that will receive the tasks.
          service,
        },
      },

      retry_config: {
        task_retry_limit: 5,
        min_backoff_seconds: 5,
        max_backoff_seconds: 20
      }
    },
  })

  return response
}

async function updateQueue(project, location, queue, service) {

  const client = new cloudTasks.CloudTasksClient()

  // Send create queue request.
  const [response] = await client.updateQueue({
    queue: {
      // The fully qualified path to the queue
      name: client.queuePath(project, location, queue),
      appEngineHttpQueue: {
        appEngineRoutingOverride: {
          // The App Engine service that will receive the tasks.
          service,
        },
      }
    }
  })

  console.log(response)
}

function createTask(route, payload, executeAt = undefined) {
  let inSeconds = undefined

  if (executeAt) {
    inSeconds = moment(executeAt).diff(moment(), "seconds")
    console.log("Execute task", route, "in", inSeconds)
  }

  return _createTask(process.env.GCLOUD_PROJECT, process.env.GCLOUD_LOCATION, process.env.GCLOUD_QUEUE, route, { payload, inSeconds })
}

function deleteTask(name) {
  const client = new cloudTasks.CloudTasksClient();

  return client.deleteTask({ name })
}

/**
 * Create a task for a given queue with an arbitrary payload.
 */
async function _createTask(project, location, queue, route = '/log_payload', options = {}) {
  if (!options.payload) {
    options.payload = {}
  }

  if (process.env.NODE_ENV == "dev") {
    options.payload.destinationurl = `${process.env.NGROK_URL}${route}`
  }

  // Instantiates a client.
  const client = new cloudTasks.CloudTasksClient();

  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue)

  const task = {
    appEngineHttpRequest: {
      httpMethod: 'POST',
      relativeUri: route,
    },
  }

  if (options.payload !== undefined) {
    options.payload = JSON.stringify(options.payload)
    task.appEngineHttpRequest.body = Buffer.from(options.payload).toString(
      'base64'
    )
  }

  if (options.inSeconds !== undefined) {
    task.scheduleTime = {
      seconds: options.inSeconds + Date.now() / 1000,
    }
  }

  const request = {
    parent: parent,
    task: task,
  }

  // Send create task request.
  const [response] = await client.createTask(request)
  // const name = response.name

  // console.log('RESPONSE TASK', response)
  return response
}

module.exports = {
  createQueue,
  createTask,
  deleteTask,
  updateQueue
}
