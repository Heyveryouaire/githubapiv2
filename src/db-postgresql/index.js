const Sequelize = require("sequelize")
const path = require("path")
const fs = require("fs")

module.exports = ({
  POSTGRESQL_HOST,
  POSTGRESQL_DB,
  POSTGRESQL_USERNAME,
  POSTGRESQL_PASSWORD
}) => {
  // Option 1: Passing parameters separately
  const sequelize = new Sequelize(
    POSTGRESQL_DB,
    POSTGRESQL_USERNAME,
    POSTGRESQL_PASSWORD,
    {
      host: POSTGRESQL_HOST,
      dialect: "postgres"
    }
  )

  // const Models = fs
  //   .readdirSync(path.join(__dirname, "models"))
  //   .filter(f => {
  //     console.log("?????", path.join(__dirname, "models", f))
  //     const stat = fs.lstatSync(path.join(__dirname, "models", f))
  //     console.log("TCL: !stat.isDirectory()", !stat.isDirectory())
  //     return !stat.isDirectory()
  //   })
  //   .reduce((models, modelName) => {
  //     console.log("TCL: modelName", modelName)
  //     // const model = createModel(
  //     //   sequelize,
  //     //   path.join(__dirname, "models", modelName)
  //     // )

  //     // models[modelName.replace('.js', '')] = model
  //     return models
  //   })

  const Models = fs
    .readdirSync(path.join(__dirname, "models"))
    .filter(f => {
      console.log("?????", path.join(__dirname, "models", f))
      const stat = fs.lstatSync(path.join(__dirname, "models", f))
      console.log("TCL: !stat.isDirectory()", !stat.isDirectory())
      return !stat.isDirectory()
    })
    .reduce((models, modelName) => {
      console.log("TCL: modelName", modelName)
      const model = createModel(
        sequelize,
        path.join(__dirname, "models", modelName)
      )
      const name = modelName.replace(".js", "")
      models[capitalize(name)] = model
      return models
    }, {})

  Models.User.belongsToMany(Models.Role, { through: "user_roles" })

  return { Models, db: sequelize }
}

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

const createModel = (sequelize, modelName) => {
  const model = require(modelName)(sequelize, {
    createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
  })

  model.sequelize = sequelize

  return model
}
