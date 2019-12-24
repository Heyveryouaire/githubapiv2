const OneSignal = require('onesignal-node')

let Singleton

const init = (env) => {

  if (Singleton) {
    return Singleton
  }
 
  // create a new Client for a single app
  const myClient = new OneSignal.Client({
    // userAuthKey: env.ONE_SIGNAL_USER_AUTH_KEY,
    // note that "app" must have "appAuthKey" and "appId" keys
    app: { appAuthKey: env.ONE_SIGNAL_APP_AUTH_KEY, appId: env.ONE_SIGNAL_APP_ID }
  })

  const sendPush = (userId, message, url = null) => {
    return new Promise(resolve => {
      // if (user.onesignal && user.onesignal.internal_id) {
      // contents is REQUIRED unless content_available=true or template_id is set.
      const firstNotification = new OneSignal.Notification({
        contents: {
          en: message,
          tr: message
        },
        filters: [
          { "field": "tag", "key": "internal_id", "relation": "=", "value": userId }
        ]
      });

      if (url) {
        firstNotification.postBody["url"] = url
      }

      myClient.sendNotification(firstNotification, function (err, _httpResponse, data) {
        resolve({ success: !err, result: data, error: err })
      })
    })
  }

  const createUser = (user, externalUser) => {
    return new Promise(resolve => {
      // If you want to add device to current app, don't add app_id in deviceBody
      const deviceBody = {
        device_type: 1,
        language: 'tr',
        tags: { internal_id: user.id, id: externalUser.id }
      };

      myClient.addDevice(deviceBody, function (err, _httpResponse, data) {
        resolve({ success: !err, result: data, error: err })
      })
    })
  }


  const updateUserTags = (onesignal_id, tags) => {
    return myClient.editDevice(onesignal_id, { tags })
  }

  Singleton = {
    sendPush,
    createUser,
    updateUserTags
  }

  return Singleton
}

module.exports = init
