//@ts-check
'use strict'

const pubsub = require('./index')

describe("pubsub", () => {

  it("test pubsub", async () => {
    pubsub.on('testEvent', async () => {
      return { success: true, result: "0", actor: "servivce-0" }
    })

    pubsub.on('testEvent', async () => {
      return { success: true, result: "1", actor: "servivce-1" }
    })

    pubsub.on('testEvent', async () => {
      return { success: true, result: "2", actor: "servivce-2" }
    })

    let res = await pubsub.emit(null, 'testEvent')

    expect([{ success: true, result: "0", actor: "servivce-0" }, { success: true, result: "1", actor: "servivce-1" }, { success: true, result: "2", actor: "servivce-2" }]).toEqual(expect.arrayContaining(res))

    res = await pubsub.emit(null, 'testEvent', null, false)
    expect([{ success: true, result: "0", actor: "servivce-0" }, { success: true, result: "1", actor: "servivce-1" }, { success: true, result: "2", actor: "servivce-2" }]).toEqual(expect.arrayContaining(res))
  })

  // fit("anoter test", () => {

  //   pubsub.emitAsync(null, "my-route", { payload: "test" }, new Date("2019-04-16T17:00:00.000Z"))
  // })

})
