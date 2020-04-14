const Sequelize = require("sequelize")
const path = require("path")
const fs = require("fs")

const { emitAsync, EVENTS } = require("../lib/pubsub")
const { snakeToCamel, monkeyPatch } = require("../lib/utils")
const { getFormattedFilters, formatOpts } = require("./utils")

let DB = null

module.exports = ({
  POSTGRESQL_HOST,
  POSTGRESQL_DB,
  POSTGRESQL_USERNAME,
  POSTGRESQL_PASSWORD,
  POSTGRESQL_PORT
}) => {
  console.log(POSTGRESQL_PASSWORD, POSTGRESQL_USERNAME, POSTGRESQL_HOST, POSTGRESQL_DB, POSTGRESQL_PORT);
  
  if (DB) return DB

  // Create sequelize model for PostgreSQL.
  const sequelize = new Sequelize(
    POSTGRESQL_DB,
    POSTGRESQL_USERNAME,
    POSTGRESQL_PASSWORD,
    {
      host: POSTGRESQL_HOST,
      port: POSTGRESQL_PORT,
      dialect: "postgres",
      // logging: false
    }
  )

  // For all files in "models/"" folder, create folder.
  const Models = fs
    .readdirSync(path.join(__dirname, "models"))
    .filter(f => {
      const stat = fs.lstatSync(path.join(__dirname, "models", f))
      return !stat.isDirectory()
    })

    // Construct model name in capitalize camel case by file name.
    .reduce((models, modelName) => {
      const model = createModel(
        sequelize,
        path.join(__dirname, "models", modelName)
      )
      const name = snakeToCamel(modelName.replace(".js", ""))
      models[capitalize(name)] = model
      return models
    }, {})

  // Create associations bewteen models.
  // Models.Event.belongsTo(Models.User, { onDelete: "CASCADE" })
  // Models.User.belongsTo(Models.Company, { onDelete: "CASCADE" })
  // Models.Invoice.belongsTo(Models.Company, { onDelete: "CASCADE" })
  // Models.Venture.belongsTo(Models.Contact)

  // Models.Order.belongsTo(Models.Venture, { onDelete: "CASCADE" })
  // Models.Pricing.belongsTo(Models.Venture, { onDelete: "CASCADE" })

  // Models.Invoice.belongsTo(Models.Venture, { onDelete: "CASCADE" })
  // Models.Invoice.belongsTo(Models.Ride, { onDelete: "CASCADE" })
  // Models.Invoice.belongsTo(Models.Order, { onDelete: "CASCADE" })
  // Models.Ride.belongsTo(Models.Venture, { onDelete: "CASCADE" })
  // Models.Ride.belongsTo(Models.Order, { onDelete: "CASCADE" })
  // Models.Ride.belongsTo(Models.Pricing, { onDelete: "CASCADE" })

  // Models.Ride.belongsTo(Models.Address, { as: "departurePosition" })
  // Models.Ride.belongsTo(Models.Address, { as: "arrivalPosition" })

  // Models.Order.hasMany(Models.Ride)
  // Models.Order.hasMany(Models.Invoice, { onDelete: "cascade", hooks: true })
  // Models.Ride.hasMany(Models.Invoice, { onDelete: "cascade", hooks: true })

  // Models.Venture.belongsToMany(Models.Company, {
  //   through: Models.VentureCompany
  //   // as: "companies"
  // })

  // Models.Company.belongsToMany(Models.Venture, {
  //   through: Models.VentureCompany
  // })

  // // Add "populate" properties.
  // // Used for front to return association on list queries.
  // Models.Invoice.populate = [
  //   { model: Models.Company },
  //   { model: Models.Order },
  //   { model: Models.Ride, include: [Models.Pricing] }
  // ]
  // Models.Venture.populate = [{ model: Models.Company }]
  // Models.Ride.populate = [
  //   { model: Models.Order },
  //   { model: Models.Pricing },
  //   { model: Models.Address, as: "departurePosition" },
  //   { model: Models.Address, as: "arrivalPosition" }
  // ]
  // Models.User.populate = [{ model: Models.Company }]

  DB = { Models, db: sequelize }

  console.log("Models", Models)
  // Models.Ride.findAll({
  //   include: [{ model: Models.Order, as: 'order' }],
  //   where: { 'Order.number': '51V1901992' }
  // }).then(console.log)
  // Models.Ride.findAll({
  //   include: [{ model: Models.Order, where: { number: '51V1901992' } }],
  // }).then(console.log)

  return DB
}

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Return Sequelize model
 * @param {*} sequelize
 * @param {*} modelName file path to model
 */
const createModel = (sequelize, modelName) => {
  try {
    // Construct the model
    let model = require(modelName)(sequelize, {
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    })

    // Create function to be compatible with old model usage (with datastore).
    model.findBy = (where, opts) => {
      const newOpts = formatOpts(model, opts)
      return model.findOne({ where, ...newOpts })
    }

    model.listBy = (where, opts = {}) => {
      const newOpts = formatOpts(model, opts)
      return model.findAll({ where, ...newOpts })
    }

    model.list = (filters, opts) => {
      const newOpts = formatOpts(model, opts)
      return model.findAll({
        where: getFormattedFilters(filters),
        ...newOpts
      })
    }

    model.get = (ids, opts = {}) => {
      const newOpts = formatOpts(model, opts)

      if (!Array.isArray(ids)) {
        return model.findByPk(ids, newOpts)
      }

      return model.listBy({ id: ids }, newOpts)
    }

    model = monkeyPatch(
      model,
      "update",
      realFunction =>
        // eslint-disable-next-line func-names
        async function(...args) {
          await realFunction.apply(this, [args[1], { where: { id: args[0] } }])

          const payload = {
            objectID: args[0],
            ...args[1]
          }

          emitAsync(null, EVENTS.ENTITY_UPDATED, {
            payload,
            modelName: capitalize(model.name)
          })

          return model.findByPk(args[0])
        }
    )

    // Delete function with algolia call if necessary.
    model.delete = ids => {
      if (!Array.isArray(ids)) {
        ids = [ids]
      }

      model.destroy({
        where: {
          id: ids
        }
      })

      if (model.algolia) {
        emitAsync(null, EVENTS.ENTITY_DELETED, {
          payload: ids,
          modelName: capitalize(model.name)
        })
      }
    }

    // If algolia, fire an event on entity modification to update algolia indexes.
    if (model.algolia) {
      // Hook after insert
      model.addHook("beforeBulkDestroy", options => {
        console.log("DELETE DELETE DELTEFLDEFL")
      })

      model.addHook("afterCreate", (entity, _options) => {
        const payload = entity.toJSON()
        payload.objectID = payload.id
        delete payload.id

        emitAsync(null, EVENTS.ENTITY_CREATED, {
          payload,
          modelName: capitalize(model.name)
        })
      })
    }

    model.sequelize = sequelize

    return model
  } catch (err) {
    console.error(modelName, err)
  }
}
