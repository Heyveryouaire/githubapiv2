//@ts-check
'use strict'

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');

const _generateTokens = (JWT_SECRET, JWT_TOKEN_EXPIRE_TIME, user) => {
  let params = {}

  if (JWT_TOKEN_EXPIRE_TIME) {
    params.expiresIn = JWT_TOKEN_EXPIRE_TIME
  }

  const token = jwt.sign(user, JWT_SECRET, params)
  const refreshtoken = randtoken.uid(256)

  return {token, refreshtoken}
}

const _validatePassword = (plainTxtPassword, hash) => {
  return  bcrypt.compareSync(plainTxtPassword, hash)
}

const _hashPassword = (LOGIN_SALT, password) => {
  return bcrypt.hashSync(password, LOGIN_SALT)
}

const _verify = (token, JWT_SECRET) => {
  return jwt.verify(token, JWT_SECRET)
}

const init = (context) => {
  const { LOGIN_SALT, JWT_SECRET, JWT_TOKEN_EXPIRE_TIME } = context.env
  
  return {
    generateTokens: (user) => _generateTokens(JWT_SECRET, JWT_TOKEN_EXPIRE_TIME, user),
    verify: (token, JWT_SECRET) => _verify(token, JWT_SECRET),
    validatePassword: _validatePassword,
    hashPassword: (password) => _hashPassword(LOGIN_SALT, password),
    TokenExpiredError: jwt.TokenExpiredError,
    JsonWebTokenError: jwt.JsonWebTokenError,
  }
}

module.exports = init
