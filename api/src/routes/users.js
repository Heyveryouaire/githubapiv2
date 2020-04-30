//@ts-check
'use strict'

const { body, param } = require('express-validator/check')
const router = require('express').Router()

const CONSTANTS = require('../lib/constants')
const { emit, EVENTS } = require('../lib/pubsub')
const ErrorWithStatusCode = require('../lib/errors/error-with-status-code')

module.exports = (context, middlewares) => {
  const { Models: { User } } = require('../db-postgresql')(context.env)
  const UserService = require('../services/userService')(context)
  const { syncRepo } = require('../services/repositoryService')(context)
  
  router
  // CREATE
  /**
   * @swagger
   * /users:
   *   post:
   *     tags:
   *       - User
   *     requestBody:
   *     description: Create user
   *     produces:
   *       - application/json
   *     consumes:
   *      - application/json
   *     parameters:
   *        - in: body
   *          name: user
   *          description: user infos
   *          schema:
   *            type: object
   *            required:
   *              - email
   *              - password
   *              - phone
   *              - lastname
   *              - firstname
   *            properties:
   *              email:
   *                type: string
   *              password:
   *                type: string
   *                description: min length 6
   *              phone:
   *                type: string
   *              lastname:
   *                type: string
   *              firstname:
   *                type: string
   *              device_type:
   *                type: string
   *                description: android:1.5 or bookingzone:1.0.0
   *     responses:
   *       201:
   *         description: Return saved user
   *         schema:
   *           $ref: '#/definitions/User'
   *       400:
   *          description: Bad request
   *       409:
   *          description: Email already exists
   */
  router.post('/', [
    body('username').not().isEmpty(),
    body('password').not().isEmpty(),
    body('password').isLength({ min: 6 }),
    middlewares.checkParametersErrors
  ], async (req, res, next) => {
    try {
      const user = await UserService.createUser(req.body)
      const tokens = UserService.generateJWTTokens(user.id)

      user.tokens = tokens

      res.status(201).json(user)
    } catch (err) {
      err.statusCode = err.statusCode || 400
      next(err)
    }
  })

  // LOGIN
  /**
   * @swagger
   * /users/login:
   *   post:
   *     tags:
   *       - User
   *     description: Login an user
   *     produces:
   *       - application/json
   *     consumes:
   *      - application/json
   *     parameters:
   *        - in: body
   *          name: user
   *          description: user infos
   *          schema:
   *            type: object
   *            required:
   *              - email
   *              - password
   *            properties:
   *              email:
   *                type: string
   *              password:
   *                type: string
   *                description: min length 6
   *     responses:
   *       200:
   *         description: Return token and refresh token
   */
  router.post('/login', [
    body('username').not().isEmpty(),
    body('password').not().isEmpty(),
    body('password').isLength({ min: 6 }),
    middlewares.checkParametersErrors
  ], async (req, res, next) => {
    try {
      const user = await UserService.checkLogin(req.body)

      if (user && (user.roles.includes(CONSTANTS.ROLES.USER) || user.roles.includes(CONSTANTS.ROLES.ADMIN))) {
        const tokens = UserService.generateJWTTokens(user.id)

        let userJSON = user
        userJSON.tokens = tokens

        syncRepo(user)

        res.status(200).json(userJSON)
      } else {
        const err = new ErrorWithStatusCode("L'utilisateur n'existe pas ou le mot de passe n'est pas valide.", 404)
        next(err)
      }
    }
    catch (err) {
      err.statusCode = err.statusCode || 400
      next(err)
    }
  })

  // VALIDATE EMAIL
  /**
   * @swagger
   * /users/validate-email/{token}:
   *   get:
   *     tags:
   *       - User
   *     description: Validate an user email
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Return status code 200 if token is validated, 400 else.
   */
  router.get('/validate-email/:token', [
    param('token').not().isEmpty(),
    middlewares.checkParametersErrors
  ], async (req, res, next) => {
    try {
      const user = await UserService.validateEmail(req.params.token)

      if (user) {
        let userJSON = user.plain()
        userJSON.isemailvalid = true
        userJSON.tokens = UserService.generateJWTTokens(userJSON.id)
        res.send(userJSON)
      } else {
        const err = new ErrorWithStatusCode(`Le token de l'utilisateur "${req.params.token}" non trouvé.`, 404)
        next(err)
      }
    } catch (err) {
      err.statusCode = err.statusCode || 400
      next(err)
    }
  })

  /**
   * @swagger
   * /users/reinit-password:
   *   post:
   *     tags:
   *       - User
   *     description: Request renew password token
   *     produces:
   *       - application/json
   *     consumes:
   *      - application/json
   *     parameters:
   *        - in: body
   *          name: email
   *          description: user email
   *          schema:
   *            type: object
   *            required:
   *              - email
   *            properties:
   *              email:
   *                type: string
   *     responses:
   *       200:
   *         description: OK
   *       404:
   *         description: User email found.
   */
  router.post('/reinit-password', [
    body('email').not().isEmpty(),
    middlewares.checkParametersErrors
  ], async (req, res, next) => {
    try {
      await UserService.requestInitPassword(req.body.email)
      res.send()
    } catch (err) {
      err.statusCode = err.statusCode || 400
      next(err)
    }
  })

  /**
   * @swagger
   * /users/reinit-password/{token}:
   *   get:
   *     tags:
   *       - User
   *     description: Login via token
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: OK.
   *       404:
   *         description: User not found with token
   */
  router.get('/reinit-password/:token', [
    param('token').not().isEmpty(),
    middlewares.checkParametersErrors
  ], async (req, res, next) => {
    try {
      const result = await UserService.loginByToken(req.params.token)
      res.send(result)
    } catch (err) {
      err.statusCode = err.statusCode || 400
      next(err)
    }
  })

  /**
   * @swagger
   * /users/reinit-password:
   *   patch:
   *     tags:
   *       - User
   *     description: Update password
   *     produces:
   *       - application/json
   *     consumes:
   *      - application/json
   *     parameters:
   *        - in: body
   *          name: email
   *          description: user email
   *          schema:
   *            type: object
   *            required:
   *              - password
   *            properties:
   *              password:
   *                type: string
   *     responses:
   *       202:
   *         description: OK
   */
  router.patch('/reinit-password', [
    middlewares.isAuthenticated,
    body('password').not().isEmpty(),
    middlewares.checkParametersErrors
  ], async (req, res, next) => {
    try {
      await UserService.reinitPassword(req.user, req.body.password)
      res.status(202).send()
    } catch (err) {
      err.statusCode = err.statusCode || 400
      next(err)
    }
  })

  /**
   * @swagger
   * /users/me:
   *   get:
   *     tags:
   *       - User
   *     description: Get current user.
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Return status code 200 if current user.
   */
  router.get('/me', [middlewares.isAuthenticated], async (req, res, next) => {
    try {
      const user = await UserService.User.get(req.user.entityKey.id)
      let userJSON = user.plain()
      userJSON.tokens = UserService.generateJWTTokens(userJSON.id)
      res.send(cleanPrivateInfos(userJSON))
    } catch (err) {
      err.statusCode = err.statusCode || 400
      next(err)
    }
  })

  const cleanPrivateInfos = (user) => {
    delete user.externalServices
    delete user.device_type
    delete user.onesignal
    delete user.verified
    return user
  }

  /**
   * @swagger
   * /users:
   *   patch:
   *     tags:
   *       - User
   *     requestBody:
   *     description: Update current user
   *     produces:
   *       - application/json
   *     consumes:
   *      - application/json
   *     parameters:
   *        - in: body
   *          name: user
   *          description: user infos
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                type: string
   *              phone:
   *                type: string
   *              lastname:
   *                type: string
   *              firstname:
   *                type: string
   *              organisation:
   *                type: string
   *              push_notifications:
   *                type: boolean
   *              sms_notifications:
   *                type: boolean
   *     responses:
   *       202:
   *         description: Return saved user
   *         schema:
   *           $ref: '#/definitions/User'
   *       400:
   *          description: Bad request
   *       409:
   *          description: Email already exists
   */
  router.patch('/', [middlewares.isAuthenticated], async (req, res, next) => {
    // Keep only authorized properties to update
    const availableProperties = ["firstname", "lastname", "email", "phone", "organisation", "push_notifications", "sms_notifications", "company"]
    // const availableProperties = ["firstname", "lastname", "email", "phone", "company"]
    const requestedFields = Object.keys(req.body)
    let properties = {}
    requestedFields.forEach(f => {
      if (availableProperties.includes(f)) {
        properties[f] = req.body[f]
      }
    })
    try { // Update the profil with the new data enter by the user
      const user = await UserService.User.update(req.user.id, properties)

      if (user && (user.roles.includes(CONSTANTS.ROLES.USER) || user.roles.includes(CONSTANTS.ROLES.ADMIN))) {
        // const tokens = await UserService.generateJWTTokens(user.id) // Generate new token
        // let userJSON = user
        // userJSON.tokens = tokens
        // console.log(userJSON)
        // res.status(200).json(userJSON)
        res.status(200).json(user)
      } else {
        const err = new ErrorWithStatusCode("L'utilisateur n'existe pas ou le mot de passe n'est pas valide.", 404)
        next(err)
      }
    }catch (err) {
      err.statusCode = err.statusCode || 400
      next(err)
    }
      

  })

  /**
   * @swagger
   * /users/add-role:
   *   post:
   *     tags:
   *       - User
   *     requestBody:
   *     description: Add User role to current user ("Safran-User", or "Ext-User")
   *     produces:
   *       - application/json
   *     consumes:
   *      - application/json
   *     parameters:
   *        - in: body
   *          name: role
   *          description: role
   *          schema:
   *            required:
   *              - role
   *            type: object
   *            properties:
   *              role:
   *                type: string
   *     responses:
   *       201:
   *         description: Role added successfully
   *         schema:
   *           $ref: '#/definitions/User'
   *       400:
   *          description: Bad request
   *       409:
   *          description: Email already exists
   */
  router.post('/add-role', [middlewares.isAuthenticated, middlewares.hasRole(CONSTANTS.ROLES.USER)], async (req, res, next) => {
    if (![CONSTANTS.ROLES.USER_EXT, CONSTANTS.ROLES.USER_SAFRAN].includes(req.body.role)) {
      next(new ErrorWithStatusCode(`Rôle inconnu ${req.body.role}.`, 400))
      return
    }

    try {
      const user = await UserService.addRole(req.user, req.body.role)
      res.status(202).send(cleanPrivateInfos(user.plain()))
    } catch (err) {
      err.statusCode = err.statusCode || 400
      next(err)
    }
  })

  // Need to be declared after router routes declaration to not override them.
  const crudRouter = require("../lib/router/crud-pg")(context, router, User, {
    // You can add checking writes middlewares.
    list: [],
    get: [],
    update: [],
    delete: [],

    // You can use them as a trigger (executed before the crud router),
    // to validate some fields, ...
    // update: (req, _res, next) => {
    //   req.body.holidays = { start: new Date() }
    //   next()
    // },
  })

  return crudRouter
}
