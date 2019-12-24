//@ts-check
'use strict'

const Errors = require('../../lib/errors')

const { validationResult } = require('express-validator/check')

const init = (context) => {
  const { JWT_SECRET } = context.env

  const jwt = require('../../lib/jwt')(context)
  const UserService = require('../../services/userService')(context)


  const isAuthenticated = (req, _res, next) => {
    const user = req.user
    let e = undefined

    if (!user) {
      e = new Errors.ErrorWithStatusCode("Utilisateur non authentifié.", 401)
    }

    next(e)
  }

  const _parseUser = async (req, _res, next) => {
    const token = req.token

    try {
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET)
        const { id } = decoded

        req.user = await UserService.User.get(id)
        // req.user = await UserService.User.get(id, null, null, null, {readAll: true})
      }

      next()
    }
    catch (e) {
      // console.error(e)
      next(e)
    }
  }

  const _hasRole = (roleName) => async (req, _res, next) => {
    let e = undefined

    if (!req.user) {
      e = new Errors.ErrorWithStatusCode("Pas d'utilisateur dans la requête.", 401)
    } else if (!req.user.roles || !req.user.roles.includes(roleName)) {
      e = new Errors.ErrorWithStatusCode(`L'utilisateur n'a pas le rôle ${roleName}.`, 401)
    }

    next(e)
  }

  const _hasOneOfRoles = (roleNames = []) => async (req, _res, next) => {
    let e = undefined

    if (!req.user) {
      e = new Errors.ErrorWithStatusCode("Pas d'utilisateur dans la requête.", 401)
    } else {
      const roleFound = roleNames.find(role => {
        return req.user.roles.includes(role)
      })

      if (!roleFound) {
        e = new Errors.ErrorWithStatusCode(`L'utilisateur n'a pas le rôle ${roleNames}.`, 401)
      }
    }

    next(e)
  }

  const checkParametersErrors = (req, _res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Errors.ErrorWithStatusCode(`Errors ${JSON.stringify(errors.array())}`, 400)
      next(error)
      return
    }

    next()
  }

  const isEmailValidated = (req, res, next) => {
    let e = undefined

    if (!req.user || !req.user.isemailvalid) {
      e = new Errors.ErrorWithStatusCode(`L'email de l'utilisateur n'est pas validé.`, 401)
    }

    next(e)
  }

  return {
    checkParametersErrors,

    parseUser: _parseUser,

    isAuthenticated: [
      _parseUser,
      isAuthenticated
    ],

    hasRole: (roleName) => [_parseUser, _hasRole(roleName)],
    hasOneOfRoles: (roleNames) => [_parseUser, _hasOneOfRoles(roleNames)],


    isEmailValidated: [
      (req, res, next) => _parseUser(req, res, next),
      (req, res, next) => isEmailValidated(req, res, next)
    ]
  }

}

module.exports = init
