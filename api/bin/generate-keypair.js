const Confirm = require('prompt-confirm');
const fs = require('fs')

const { createAndWriteKeyPair } = require('../src/lib/crypt')()

new Confirm(`Do you want to generate key pair environment?`)
  .ask(function (answerOne) {
    if (!answerOne) {
      console.log('Generate with: npm run generate-keypair')
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
  return fs.existsSync(`./config/public.pem`) && fs.existsSync(`./config/private.pem`)
}
