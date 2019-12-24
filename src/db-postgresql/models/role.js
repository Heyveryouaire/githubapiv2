const Sequelize = require("sequelize")

module.exports = (sequelize, defaultFields = {}) => {
  const Role = sequelize.define(
    "role",
    {
      ...defaultFields,
      // attributes
      name: {
        type: Sequelize.STRING,
        allowNull: false
      }
    },
    {
      // options
    }
  )

  return Role
}
