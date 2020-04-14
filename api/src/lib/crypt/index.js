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

const writeKeyPair = (keypair) => {
  if (!keypair) {
    throw new Error("Missing pair key to write them")
  }

  const keypairPath = {
    publicPath: path.join(__dirname, '../../../config/public.pem'),
    privatePath: path.join(__dirname, '../../../config/private.pem')
  }

  fs.writeFileSync(keypairPath.publicPath, keypair.public)
  fs.writeFileSync(keypairPath.privatePath, keypair.private)

  return keypairPath
}

const createAndWriteKeyPair = () => {
  const keypair = createKeyPair()
  const paths = writeKeyPair(keypair)
  loadKeys()
  return paths
}

const loadKeys = () => {
  if (!fs.existsSync(path.join(__dirname, '../../../config', `public.pem`)) || !fs.existsSync(path.join(__dirname, '../../../config/private.pem'))) {
    throw new Error(`${path.join(__dirname, '../../../config', `public.pem`)} or ${path.join(__dirname, '../../../config/private.pem')} not found`)
  }

  const publicKeyString = fs.readFileSync(path.join(__dirname, '../../../config/public.pem'))
  const privateKeyString = fs.readFileSync(path.join(__dirname, '../../../config/private.pem'))

  let key = new NodeRSA({ b: 512 })
  key.setOptions({ encryptionScheme: 'pkcs1' }) // important -> set the encypt scheme

  key.importKey(publicKeyString, 'public')
  key.importKey(privateKeyString, 'private')

  return key
}

const encode = (key, data) => {
  if (!key) {
    key = loadKeys()
    // throw new Error('Load keys before encode data')
  }

  return key.encrypt(data, 'base64', 'utf8')
}

const decode = (key, data) => {
  if (!key) {
    key = loadKeys()
    // throw new Error('Load keys before decode data')
  }

  return key.decrypt(data, 'utf8')
}

module.exports = () => {
  let key;

  return {
    createKeyPair: () => createKeyPair(),
    writeKeyPair: (keypair) => writeKeyPair(keypair),
    createAndWriteKeyPair: () => createAndWriteKeyPair(),
    loadKeys: () => {
      key = loadKeys()
    },
    encode: (data) => encode(key, data),
    decode: (data) => decode(key, data)
  }
}
