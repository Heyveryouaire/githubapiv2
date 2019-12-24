//@ts-check
'use strict'

const _track = (Event, User, user, name, payload) => {
  const event = new Event({
    name,
    payload,
    user: user ? User.key(user) : null
  })
  return event.save()
}

const init = (GCLOUD_PROJECT, GCLOUD_DATASTORE_NAMESPACE) => {
  // const { Event, User } = require('../../db')(GCLOUD_PROJECT, GCLOUD_DATASTORE_NAMESPACE)

  return {
    // track: (userId, eventName, payload) => _track(Event, User, userId, eventName, payload)
    track: (userId, eventName, payload) => _track()
  }
}

module.exports = init
