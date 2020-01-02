//@ts-check
"use strict"

const CONSTANTS = require("../constants")
const Errors = require("../errors")
const { mergeDeep } = require("../utils")
const { convertOperator } = require("../../db-postgresql/utils")

/**
 * Construct CRUD router for Model
 * @param {*} router Express router
 * @param {*} Model GStore-Node Model
 * @param {*} middelwares Object with middelwares for action:
 * - list: middelwares for list models
 * - get: middelwares for get model by id
 * - post: middelwares for create a model
 * - update: middelwares for update model by id
 * - delete: middelwares for delete model by id
 */
const init = (context, router, Model, middelwares = {}) => {
  // const Models = Model.gstore.models

  const { hasRole } = require("../../routes/middlewares")(context)

  if (!middelwares.create) middelwares.create = [hasRole(CONSTANTS.ROLES.ADMIN)]
  if (!middelwares.update) middelwares.update = [hasRole(CONSTANTS.ROLES.ADMIN)]
  if (!middelwares.list) middelwares.list = [hasRole(CONSTANTS.ROLES.ADMIN)]
  if (!middelwares.get) middelwares.get = [hasRole(CONSTANTS.ROLES.ADMIN)]
  if (!middelwares.delete) middelwares.delete = [hasRole(CONSTANTS.ROLES.ADMIN)]

  // if (!middelwares.create) middelwares.create = []
  // if (!middelwares.update) middelwares.update = []
  // if (!middelwares.list) middelwares.list = []
  // if (!middelwares.get) middelwares.get = []
  // if (!middelwares.delete) middelwares.delete = []

  /**
   * List elements.
   * You can pass arguments in url with:
   * - limit: Integer: limit results number
   * - offset: Integer: Pagination
   * - order: Array: Example: [{ "property": "created_at", "descending": true }]
   */
  router.get("/", middelwares.list, async (req, res, next) => {
    try {
      if (req.query.order) {
        try {
          req.query.order = JSON.parse(req.query.order)
        } catch (err) {
          console.error(err)
        }
      }

      let filters = []

      if (req.query.filters) {
        try {
          filters = JSON.parse(req.query.filters)
          console.log("TCL: filters", filters)
        } catch (err) {
          console.error(err)
        }
      }

      const formattedFilters = filters.reduce((formattedFilters, filter) => {
        if (filter.length === 2) {
          formattedFilters[filter[0]] = filter[1]
        } else {
          const operator = convertOperator(filter[1])
          formattedFilters[filter[0]] = { [operator]: filter[2] }
        }

        return formattedFilters
      }, {})

      const results = await Model.findAndCountAll({
        where: formattedFilters,
        ...req.query,
        raw: true
      })

      res.set("X-Total-Count", results.count)
      res.send(results.rows)
    } catch (err) {
      err.statusCode = err.statusCode || 500
      next(err)
    }
  })

  /**
   * Return model by id
   */
  router.get("/:id", middelwares.get, async (req, res, next) => {
    try {
      const element = await Model.findByPk(req.params.id)

      if (!element) {
        throw new Errors.ErrorWithStatusCode(
          `${Model.name} Not found with id ${req.params.id}`,
          404
        )
      }

      res.send(element.toJSON())
    } catch (err) {
      err.statusCode = err.statusCode || 500
      next(err)
    }
  })

  /**
   * Create model
   */
  router.post("/", middelwares.create, async (req, res, next) => {
    try {
      const elementSaved = await Model.create(req.body)
      // const element = new Model(req.body)
      // const elementSaved = await element.save()
      res.status(201).send(elementSaved.toJSON())
    } catch (err) {
      err.statusCode = err.statusCode || 500
      next(err)
    }
  })

  /**
   * Update model
   */
  router.patch("/:id", middelwares.update, async (req, res, next) => {
    try {
      const element = await Model.findByPk(req.params.id)

      if (!element) {
        throw new Errors.ErrorWithStatusCode(
          `${Model.name} Not found with id ${req.params.id}`,
          404
        )
      }
      // const element = result.entityData
      // let params = {}

      // Object.keys(req.body).forEach(key => {
      //   params[key] = element[key]
      // })

      // let paramstest = mergeDeep(params, req.body)

      const [result] = await Model.update(req.body, {
        where: { id: req.params.id }
      })

      if (!result) {
        next(
          new Error(
            "Un erreur est survenue lors de la mise à jour de l'élément"
          )
        )
        return
      }

      const elementUpdated = await Model.findByPk(req.params.id)

      console.log("TCL: init -> elementUpdated", elementUpdated)
      // const elementUpdated = await Model.update(req.params.id, paramstest)
      res.status(202).send(elementUpdated.toJSON())
    } catch (err) {
      err.statusCode = err.statusCode || 500
      next(err)
    }
  })

  /**
   * Delete model
   */
  router.delete("/:id", middelwares.delete, async (req, res, next) => {
    try {
      const result = await Model.destroy({
        where: {
          id: req.params.id
        }
      })

      if (!result) {
        next(new Error("Une erreur est survenue"))
        return
      }

      console.log("TCL: init -> result", result)
      res.sendStatus(204)
    } catch (err) {
      err.statusCode = err.statusCode || 500
      next(err)
    }
  })

  return router
}

module.exports = init
