const Sequelize = require("sequelize")

module.exports = (sequelize, defaultFields = {}) => {
  const Repository = sequelize.define(
    "repository",
    {
      ...defaultFields,
      // attributes
      name: {
        type: Sequelize.STRING,
      }    
    }
  )

  return Repository
}
