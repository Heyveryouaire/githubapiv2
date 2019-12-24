//@ts-check
'use strict'

const fs = require('fs')
const path = require('path')

let Models
module.exports = (GCLOUD_PROJECT, GCLOUD_DATASTORE_NAMESPACE) => {
  if (!Models) {
    const datastore = require('./datastore')(GCLOUD_PROJECT, GCLOUD_DATASTORE_NAMESPACE)

    Models = fs.readdirSync(path.join(__dirname, "models"))
      .filter(f => {
        const stat = fs.lstatSync(path.join(__dirname, "models", f))
        return !stat.isDirectory()
      })
      .reduce((models, model) => {
        const GstoreModel = createModel(require(path.join(__dirname, "models", model))(datastore))
        const modelName = GstoreModel.entityKind

        models[modelName] = GstoreModel

        return models
      }, {})
  }

  return Models
}

const createModel = (Model) => {

  Model.deleteBy = async (object) => {
    const entityFound = await Model.findBy(object)

    if (entityFound) {
      return Model.delete(entityFound.entityKey.id)
    }

    return null
  }

  Model.deleteAllBy = async (object) => {
    const entitiesFound = await Model.listBy(object)

    if (entitiesFound && entitiesFound.length) {
      return Promise.all(entitiesFound.map(e => Model.delete(e.id)))
    }

    return null
  }

  // Dirty retries
  Model.findBy = (object, opts = {}, retries = 0) => {
    return new Promise(async resolve => {
      try {
        const res = await Model.findOne(object, null, null, opts)

        resolve(res)
      } catch (err) {

        if (retries < 3) {
          setTimeout(() => {
            resolve(Model.findBy(object, opts, retries + 1))
          }, 5)
        } else {
          resolve(null)
        }
      }
    })
  }

  // TODO
  // Use opts: order by, ...
  /**
   * @typedef {{order?: Order, limit?: number, offset?: number }} ListByOptions
   * @param {Object} object
   * @param {ListByOptions} [opts]
   * @param {Array} [populate]
   * @return {Promise<Object[]>}
   */
  Model.listBy = async (object, opts = {}, populate = []) => {
    if (!object || Object.keys(object).length == 0) {
      throw new Error('listBy need an object')
    }

    let query = Model.query()
    const keys = Object.keys(object)

    for (let i = 0; i < keys.length; i++) {
      query = query.filter(keys[i], "=", object[keys[i]])
    }

    if (opts.order) {
      query = query.order.call(query, opts.order)
    }

    if (opts.limit) {
      query = query.limit.call(query, opts.limit)
    }

    if (opts.offset) {
      query = query.order.call(query, opts.offset)
    }

    const run = query.run()

    populate.forEach(p => {
      run.populate(p)
    })

    const res = await run

    return res.entities
  }

  /**
   * @typedef {[string, '>' | '<' | '=' | '<=' | '>=' | '!=', any]} Filter
   * @typedef {[string, {descending: false}] | [string]} Order
   * @typedef {{filters?: Filter[], order?: Order, limit?: number, offset?: number }} Options
   * @param {Options} opts
   * @param {Array} [populate]
   * @return {Promise<Object[]>}
   */
  Model.findWithOpts = async (opts = {}, populate = []) => {
    if (!opts || Object.keys(opts).length == 0)
      throw new Error("findBy requires at least one of filters, order, limit, or offset properties")

    let query = Model.query()

    if (opts.filters) {
      query = opts.filters.reduce((q, filter) => {
        return q.filter.apply(q, filter)
      }, query)
    }

    if (opts.order) {
      query = query.order.apply(query, opts.order)
    }

    if (opts.limit) {
      query = query.limit.call(query, opts.limit)
    }

    if (opts.offset) {
      query = query.offset.call(query, opts.offset)
    }

    const run = query.run()

    populate.forEach(p => {
      run.populate(p)
    })

    const res = await run

    return res.entities
  }

  Model.exists = async (id) => {
    let exists = false

    try {
      const userFound = await Model.get(id)

      return exists = userFound != null
    } catch (err) {
      console.error(err)
    }

    return exists
  }

  return Model
}
