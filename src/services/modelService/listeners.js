//@ts-check
'use strict'

const { on, emitAsync } = require('../../lib/pubsub')
// const CONSTANTS = require('../../lib/constants')

module.exports = (_context) => {

  // Create listener on "test-event".
  // Listener must return Object with success = false or true.
  // If success is false, Task will be retried later.
  on("test-event", (payload) => {
    console.log('PAYLOAD', payload)
    return { success: true }
  })

  // Execute task with Cloud Task
  // emitAsync(null, "test-event", { tata: "tata", "tutu": "tututu" })

  // Execute task with Promise.
  // emit(null, "test-event", { tata: "tata", "tutu": "tututu" })
}
