const CONSTANTS = require('../src/lib/constants')

module.exports = {

  up: async (context) => {
    const { BusLine } = require('../src/db')(context.env.GCLOUD_PROJECT)

    const lines = await BusLine.list()

    return Promise.all(lines.entities.map(line => {
      return BusLine.update(line.id, { service: CONSTANTS.SERVICES.FIXE })
    }))
  },

  down: (/*context*/) => {
    console.log('down 0')
  }
}
