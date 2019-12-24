//@ts-check
'use strict'

describe("Track", () => {
  const { getValidUserEntity } = require('../../lib/test')
  const { track } = require('./index')(process.env.GCLOUD_PROJECT, process.env.GCLOUD_DATASTORE_NAMESPACE)

  it("Create an event", async () => {
    const user = await getValidUserEntity()

    let res = await track(user.entityKey.id, "event name", {
      params: {
        property: "value"
      }
    })

    expect(res).not.toBeNull()
    expect(res).not.toBeUndefined()

    res = await track(null, "event name", {
      params: {
        property: "value"
      }
    })

    expect(res).not.toBeNull()
    expect(res).not.toBeUndefined()
  })
})
