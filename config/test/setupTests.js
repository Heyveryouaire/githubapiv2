const spawn = require('child_process').spawn

require('../../src/lib/test')

const scriptArgs = ['beta', 'emulators', 'datastore', 'start', '--no-store-on-disk', '--consistency=1']
let child
let resolved = false

const { createKeyPair } = require('../../src/lib/test')

createKeyPair()



module.exports = () => {
  return new Promise(resolve => {



    process.on('unhandledRejection', (_err) => {
      // console.log('setuptest unhandledRejection')
      if (!resolved) {
        resolved = true
        resolve()
      }
    })
    // process.on('uncaughtException', (_err) => {
    //   console.log('setuptest uncaughtException')
    // })


    child = spawn('gcloud', scriptArgs)

    child.stderr.on('data', () => {
      // console.log('stderrDTA', data.toString())
      if (!resolved) {
        resolved = true
        resolve()
      }
    })

    child.stdout.on('exit', () => {
      // console.log('exit code', code)

      if (!resolved) {
        resolved = true
        resolve()
      }
    })
    child.stdout.on('data', () => {
      // console.log('stdout', data.toString())

      if (!resolved) {
        resolved = true
        resolve()
      }
    })
  })
}
