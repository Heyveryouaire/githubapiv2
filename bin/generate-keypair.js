const Confirm = require('prompt-confirm');
const fs = require('fs')

const env = process.env.NODE_ENV || "test"

if (!["test", "dev", "production", "staging"].includes(env)) {
  console.error('Only supported environment: "test", "dev" or "production"')
  // eslint-disable-next-line
  process.exit(-1)
}

const { createAndWriteKeyPair } = require('../src/lib/crypt')(env)

new Confirm(`Do you want to generate key pair for "${env}" environment?`)
  .ask(function (answerOne) {
    if (!answerOne) {
      console.log('Environments choice: "test", "dev", "staging" or "production". Generate with: NODE_ENV=dev npm run generate-keypair')
    } else if (isKeyPair()) {
      new Confirm(`Key pair already exists. Do you want to override it?`)
        .ask(function (answerTwo) {
          if (answerTwo) {
            createKeyPair()
          }
        })
    } else {
      createKeyPair()
    }
  });

const createKeyPair = () => {
  const paths = createAndWriteKeyPair()

  console.log('Write key pair')
  console.log(paths)
}

const isKeyPair = () => {
  return fs.existsSync(`./config/${env}/public.pem`) && fs.existsSync(`./config/${env}/private.pem`)
}
