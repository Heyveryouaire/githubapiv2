const spawn = require('child_process').spawn

const scriptArgs = ['-f', 'emulators', 'CloudDatastore.jar']
let child
let resolved = false



module.exports = () => {
  return new Promise(resolve => {

    process.on('unhandledRejection', (_err) => {
      // console.log(_err)
      // console.log('teardown unhandledRejection')

      if (!resolved) {
        resolved = true
        resolve()

      }
      process.exit(0)
    })


    child = spawn('pkill', scriptArgs)

    child.stderr.on('data', () => {
      if (!resolved) {
        resolved = true
        resolve()
      }
    })

    child.stdout.on('exit', () => {
      if (!resolved) {
        resolved = true
        resolve()
      }
    })
    child.stdout.on('data', () => {
      if (!resolved) {
        resolved = true
        resolve()
      }
    })

    child.once('exit', function(_code){
      if (!resolved) {
        resolved = true
        resolve()
      }

      /*eslint no-process-exit: off*/
      process.exit(0)
    })
  })
}
