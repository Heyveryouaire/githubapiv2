//@ts-check
"use strict"

const randomstring = require("randomstring")

const { emit, EVENTS } = require("../../lib/pubsub")
const Errors = require("../../lib/errors")
const CONSTANTS = require("../../lib/constants")
// const { randomIntBetween } = require('../../lib/utils')

const TOKEN_LENGTH = 24

// let LISTENERS_STARTED = false
let Singleton

/**
 * Return user service instance
 * @param {*} context
 * @param {*} start_listeners
 */
const init = (context, _start_listeners = true) => {
  if (Singleton) {
    return Singleton
  }

  const {
    Models: { User }
  } = require("../../db-postgresql")(context.env)
  const jwt = require("../../lib/jwt")(context)

  /**
   * Create user in db
   * @param {*} params
   */
  async function createUserInDb(params) {
    // let user = await User.findOne({ where: { email: params.email } })

    // if (user) {
    //   throw new Errors.ErrorWithStatusCode(
    //     `Email ${params.email} déjà pris.`,
    //     409
    //   )
    // }

    // user = await User.findOne({ where: { phone: params.phone } })

    // // Regular users are subject to phone number unicity constraint.
    // // Drivers should be updated if one is found with the same phone number.
    // if (user) {
    //   throw new Errors.ErrorWithStatusCode(
    //     `Numéro de téléphone "${params.phone}" déjà pris.`,
    //     409
    //   )
    // }
    let user = await User.findOne({ where : { username : params.username } })

    if(user){
      throw new Errors.ErrorWithStatusCode(
        `Impossible, nom déjà pris !`, 409
      )
    }

    user = new User(params)
    console.log("TCL: createUserInDb -> user", user)

    const token = generateToken()
    user.password = jwt.hashPassword(params.password)
    user.token = token

    const userSaved = await user.save()

    return userSaved.toJSON()
  }

  /**
   * Create an user
   * @param {*} params
   */
  async function createUser(params) {
    // params.roles = [params.role]

    if (!params.roles) params.roles = []
    params.roles.push(CONSTANTS.ROLES.USER)

    return createUserInDb(params)
  }

  /**
   * Add a role to the user roles.
   * @param {*} user
   * @param {*} role
   */
  async function addRole(user, role) {
    if (!Object.values(CONSTANTS.ROLES).includes(role)) {
      throw new Errors.ErrorWithStatusCode("Mauvais rôle.", 400)
    }

    let roles = user.roles

    if (!roles.includes(role)) {
      user.roles.push(role)
      let params = {
        roles: user.roles
      }

      return User.update(user.entityKey.id, params)
    }

    return user
  }

  /**
   * Set only a role to an user.
   * @param {*} user
   * @param {*} role
   */
  function setRole(user, role) {
    if (!Object.values(CONSTANTS.ROLES).includes(role)) {
      throw new Error(`Le rôle ${role} n'existe pas.`)
    }

    let roles = [role]

    user.roles.push(role)
    return User.update(user.id, { roles })
  }

  /**
   * Generate a random token.
   */
  function generateToken() {
    return randomstring.generate(TOKEN_LENGTH)
  }

  /**
   * Authenticate a user by email and password.
   * @param {*} param
   */
  const authenticate = async ({ username = "", password = "" } = {}) => {
    if (!username || !password) {
      throw new Error("Email ou mot de passe manquant.")
    }

    // Check email / password.
    const user = await checkLogin({ username, password })

    // If user found, generate JWT tokens
    if (user && jwt.validatePassword(password || "", user.password)) {
      if (!user.isemailvalid) {
        throw new Errors.ErrorWithStatusCode("Email non validé.", 401)
      }

      // Generate JWT tokens
      const { token, refreshtoken } = generateJWTTokens(user.entityKey.id)

      emit(user.entityKey.id, EVENTS.USER_AUTHENTICATED, user.plain())

      return { token, refreshtoken, user: user }
    }

    return null
  }

  /**
   * Check login by email and password.
   * @param {*} param0
   */
  const checkLogin = async ({ username, password }) => {
    console.log("username ", username);
    
    let user = await User.findBy(
      
      { username },
      { readAll: true, select: ["password", "isemailvalid"] }
    )
    if(user) {
      user = user.dataValues
    }
    console.log("user", user);
    // Check if password is ok.
    if (user && !jwt.validatePassword(password || "", user.password)) {
      user = null
    }

    return user
  }

  /**
   * Generate JWT tokens by id
   * @param {*} id
   */
  const generateJWTTokens = (id = "") => {
    if (!id) {
      throw new Error(
        "Pas d'identification d'utilisateur pour générer les tokens JWT."
      )
    }

    return jwt.generateTokens({ id })
  }

  /**
   * Validate email by token.
   * If token is validated, set token fiekld to null, and isemailvalid to true.
   * @param {*} token
   */
  async function validateEmail(token) {
    const user = await findUserBytoken(token)

    try {
      await User.update(user.entityKey.id, { isemailvalid: true, token: null })

      emit(user.entityKey.id, EVENTS.USER_EMAIL_VALIDATED, user.plain())

      return user
    } catch (err) {
      console.error(err)
    }
  }

  const findUserBytoken = async token => {
    if (!token) {
      throw new Errors.ErrorWithStatusCode("Token manquant.", 400)
    }

    const user = await User.findBy(
      { token },
      { readAll: true, select: "password" }
    )

    if (!user) {
      throw new Errors.ErrorWithStatusCode(
        `Utilisateur non trouvé avec le token ${token}`,
        404
      )
    }

    return user
  }

  /**
   * Generate email token by user email.
   * Usefull for forgotten password.
   * @param {*} email
   */
  async function generatePasswordTokenByEmail(email) {
    if (!email) {
      throw new Error("Email manquant.")
    }

    const user = await User.findBy({ email })

    if (!user) {
      throw new Error(`Utilisateur non trouvé avec l'email ${email}.`)
    }

    const token = generateToken()

    await User.update(user.entityKey.id, { token })

    return token
  }

  const requestInitPassword = async email => {
    const user = await User.findBy({ email })

    if (!user) {
      throw new Errors.ErrorWithStatusCode(
        `Utilisateur non trouvé avec l'email ${email}`,
        404
      )
    }

    const token = generateToken()
    await User.update(user.entityKey.id, { token })
    emit(user.entityKey.id, EVENTS.REINIT_PASSWORD, { email, token })
  }

  const loginByToken = async token => {
    const user = await findUserBytoken(token)
    await User.update(user.entityKey.id, { token: null })
    return generateJWTTokens(user.entityKey.id)
  }

  const reinitPassword = (user, password) => {
    return User.update(user.entityKey.id, {
      password: jwt.hashPassword(password)
    })
  }

  Singleton = {
    User,
    createUser,
    authenticate,
    validateEmail,
    generatePasswordTokenByEmail,
    generateJWTTokens,
    addRole,
    setRole,
    checkLogin,
    requestInitPassword,
    loginByToken,
    reinitPassword
  }

  return Singleton
}

module.exports = context => {
  const userService = init(context)

  return userService
}
