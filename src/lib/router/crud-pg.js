//@ts-check
"use strict"

const CONSTANTS = require("../constants")
const Errors = require("../errors")
const { mergeDeep } = require("../utils")

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

      // if (req.query.filters) {
      // const paths = Model.rawAttributes
      // try {
      //   req.query.filters = JSON.parse(req.query.filters)
      //     .map(filter => {
      //       let property = filter[0]
      //       if (paths[property]) {
      //         console.log('In schema', property, 'type:', paths[property].type, '(', typeof paths[property].type, ')')
      //       }
      //       else {
      //         console.log('Schema doesn\'t have a', property, 'property')
      //       }
      //       // Handle cases where we want to filter on a reference to an other
      //       // entity (e.g.: all rides associated with driver wit id "349039820111")
      //       // if (paths[property] && paths[property].type == 'entityKey') {
      //       //   const modelName = paths[property].ref
      //       //   const refModel = Models[modelName]
      //       //   filter[1] = refModel.key(filter[1])
      //       // }
      //       // Casts values according to model spec, if it provides a cating function
      //       // e.g: Dates
      //       // else if (paths[property] && typeof paths[property].type == 'function' && paths[property].type.name != "Boolean" && paths[property].type.name != "String" && paths[property].type.name != "Number") {
      //       //   const lastIndex = filter.length - 1
      //       //   let lastValue = filter[lastIndex]
      //       //   // Handle nested path, eg ["params", {pmr: true}]
      //       //   if(typeof lastValue == 'object'){
      //       //     const propKey = Object.keys(lastValue)[0]
      //       //     property = `${property}.${propKey}`
      //       //     lastValue = lastValue[propKey]
      //       //     filter[0] = property
      //       //     filter[lastIndex] = lastValue
      //       //   }else{
      //       //     filter[lastIndex] = new paths[property].type(lastValue)
      //       //   }
      //       // }
      //       return filter
      //     })
      // } catch (err) {
      //   console.error(err)
      // }
      // }

      let filters = {}

      if (req.query.filters) {
        try {
          filters = JSON.parse(req.query.filters)
          console.log("TCL: filters", filters)
        } catch (err) {
          console.error(err)
        }
      }

      const results = await Model.findAndCountAll({
        where: filters,
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

      const elementUpdated = await Model.update(req.body, {
        where: { id: req.params.id }
      })
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
      const result = await Model.delete(req.params.id)
      res.status(204).send(result)
    } catch (err) {
      err.statusCode = err.statusCode || 500
      next(err)
    }
  })

  return router
}

module.exports = init
