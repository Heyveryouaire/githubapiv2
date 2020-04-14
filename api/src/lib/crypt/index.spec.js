//@ts-check
'use strict'

const fs = require('fs')
const path = require('path')

describe("Crypt lib", () => {
  const { createKeyPair, writeKeyPair, createAndWriteKeyPair, loadKeys, decode, encode } = require('./index')("test")

  afterAll(() => {
    fs.unlinkSync(path.join(__dirname, "../../../config/test/public.pem"))
    fs.unlinkSync(path.join(__dirname, "../../../config/test/private.pem"))
  })

  it("createKeyPair", () => {
    const keypair = createKeyPair()

    expect(keypair).not.toBeNull()
    expect(keypair).toHaveProperty("public")
    expect(keypair).toHaveProperty("private")
  })

  it("writeKeyPair throws an error when no key pair given", () => {
    try {
      writeKeyPair()
      expect(true).toBeFalsy()
    } catch (err) {
      expect(err).not.toBeNull()
    }
  })

  it("writeKeyPair", () => {
    const keypair = createKeyPair()
    const paths = writeKeyPair(keypair)

    expect(paths).not.toBeNull()
    expect(paths).toHaveProperty("publicPath")
    expect(paths).toHaveProperty("privatePath")

    expect(fs.existsSync(paths.publicPath)).toBeTruthy()
    expect(fs.existsSync(paths.privatePath)).toBeTruthy()

  })

  it("loadKeys", () => {
    const key = loadKeys()
    expect(key).not.toBeNull()

    fs.unlinkSync(path.join(__dirname, "../../../config/test/public.pem"))
    fs.unlinkSync(path.join(__dirname, "../../../config/test/private.pem"))
  })

  it("createAndWriteKeyPair", () => {
    const paths = createAndWriteKeyPair()
    expect(paths).not.toBeNull()
    expect(paths).toHaveProperty("publicPath")
    expect(paths).toHaveProperty("privatePath")

    expect(fs.existsSync(paths.publicPath)).toBeTruthy()
    expect(fs.existsSync(paths.privatePath)).toBeTruthy()
  })

  it("encode", () => {
    createAndWriteKeyPair()
    const text = "My text"
    const encodedText = encode(text)

    expect(text).not.toEqual(encodedText)
  })

  it("decode", () => {
    createAndWriteKeyPair()
    const text = "My text"
    const encodedText = encode(text)
    
    expect(text).not.toEqual(encodedText)
    
    const decodedText = decode(encodedText)

    expect(decodedText).not.toEqual(encodedText)
    expect(text).toEqual(decodedText)
  })
})
