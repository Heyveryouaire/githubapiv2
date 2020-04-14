const LOGIN_SALT = "$2b$10$lFb/oEfUNDEDuG1MRadN2O"
const JWT_SECRET = "JWT_SECRET"
const JWT_TOKEN_EXPIRE_TIME = null

const jwt = require('./index')({ env: { LOGIN_SALT, JWT_SECRET, JWT_TOKEN_EXPIRE_TIME }})

describe("JWT test", () => {

  it("Password must be different after hash", () => {
    const password = "mypassword"
    const hashPassword = jwt.hashPassword(password)

    expect(hashPassword).not.toEqual(password)
  })

  it("Validate password after hash", () => {
    const password = "mypassword"
    const hashPassword = jwt.hashPassword(password)
    const passwordValidated = jwt.validatePassword(password, hashPassword)

    expect(passwordValidated).toBeTruthy()
  })

  it("Generate tokens", () => {
    const user = {id: 33}
    const tokens = jwt.generateTokens(user)

    expect(tokens).not.toBeNull()
    expect(tokens).toMatchObject({
      token: expect.any(String),
      refreshtoken: expect.any(String)
    })
  })

  it("Expired tokens", () => {
    const newJwt = require('./index')({env: { LOGIN_SALT, JWT_SECRET, JWT_TOKEN_EXPIRE_TIME: '1ms' }});
    const user = {id: 33}
    const tokens = newJwt.generateTokens(user)

    return new Promise(resolve => {
      setTimeout(() => {

        try {
          newJwt.verify(tokens.token, JWT_SECRET)
          expect(true).not.toBeTruthy()
          resolve()
        } catch (err) {
          expect(err).toBeInstanceOf(newJwt.TokenExpiredError)
          resolve()
        }
      }, 2)
    })
  })

  it("Mal formated token", () => {
    try {
      jwt.verify("token", JWT_SECRET)
      expect(true).not.toBeTruthy()
    } catch (err) {
      expect(err).toBeInstanceOf(jwt.JsonWebTokenError)
    }
  })


})
