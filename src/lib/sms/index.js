//@ts-check
'use strict'

const Nexmo = require('nexmo');

const init = (NEXMO_API_KEY, NEXMO_API_SECRET) => {

  const nexmo = new Nexmo(
    {
      apiKey: NEXMO_API_KEY,
      apiSecret: NEXMO_API_SECRET
    },
    {
      debug: true
    });

  const send = (from, to, text) => {
    if (["test", "dev"].includes(process.env.NODE_ENV)) {
      console.log("** SEND SMS **")
      console.log("** FROM:", from)
      console.log("** TO:", to)
      console.log("** TEXT:", text)
    } else {
      nexmo.message.sendSms(from, to, text)
    }
  }

  return { send }
}

module.exports = init
