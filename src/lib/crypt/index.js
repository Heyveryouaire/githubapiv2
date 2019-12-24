//@ts-check
'use strict'

const NodeRSA = require('node-rsa');
const fs = require('fs')
const path = require('path')

const createKeyPair = () => {
  const key = new NodeRSA({ b: 512 });
  key.setOptions({ encryptionScheme: 'pkcs1' }); // important -> set the encypt scheme

  return {
    public: key.exportKey('public'),
    private: key.exportKey('private')
  }
}

const writeKeyPair = (env, keypair) => {
  if (!keypair) {
    throw new Error("Missing pair key to write them")
  }

  const keypairPath = {
    publicPath: path.join(__dirname, '../../../config', env, `public.pem`),
    privatePath: path.join(__dirname, '../../../config', env, `private.pem`)
  }

  fs.writeFileSync(keypairPath.publicPath, keypair.public)
  fs.writeFileSync(keypairPath.privatePath, keypair.private)

  return keypairPath
}

const createAndWriteKeyPair = (env) => {
  const keypair = createKeyPair()
  const paths = writeKeyPair(env, keypair)
  loadKeys(env)
  return paths
}

const loadKeys = (env) => {
  if (!fs.existsSync(path.join(__dirname, '../../../config', env, `public.pem`)) || !fs.existsSync(path.join(__dirname, '../../../config', env, `private.pem`))) {
    throw new Error(`${path.join(__dirname, '../../../config', env, `public.pem`)} or ${path.join(__dirname, '../../../config', env, `private.pem`)} not found`)
  }

  const publicKeyString = fs.readFileSync(path.join(__dirname, '../../../config', env, `public.pem`))
  const privateKeyString = fs.readFileSync(path.join(__dirname, '../../../config', env, `private.pem`))

  let key = new NodeRSA({ b: 512 })
  key.setOptions({ encryptionScheme: 'pkcs1' }) // important -> set the encypt scheme

  key.importKey(publicKeyString, 'public')
  key.importKey(privateKeyString, 'private')

  return key
}

const encode = (env, key, data) => {
  if (!key) {
    key = loadKeys(env)
    // throw new Error('Load keys before encode data')
  }

  return key.encrypt(data, 'base64', 'utf8')
}

const decode = (env, key, data) => {
  if (!key) {
    key = loadKeys(env)
    // throw new Error('Load keys before decode data')
  }

  return key.decrypt(data, 'utf8')
}

module.exports = (env) => {
  let key;

  return {
    createKeyPair: () => createKeyPair(),
    writeKeyPair: (keypair) => writeKeyPair(env, keypair),
    createAndWriteKeyPair: () => createAndWriteKeyPair(env),
    loadKeys: () => {
      key = loadKeys(env)
    },
    encode: (data) => encode(env, key, data),
    decode: (data) => decode(env, key, data)
  }
}
