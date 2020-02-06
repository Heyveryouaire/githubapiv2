const Sequelize = require("sequelize")

module.exports = (sequelize, defaultFields = {}) => {
  const User = sequelize.define(
    "user",
    {
      ...defaultFields,
      // attributes
      firstname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false
        // allowNull defaults to true
      },
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true
        },
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        read: false,
        allowNull: false,
        get() {
          return undefined
        }
      },
      phone: { type: Sequelize.STRING, optional: true },
      token: { type: Sequelize.STRING, optional: true, read: false },
      roles: { type: Sequelize.ARRAY(Sequelize.TEXT) , default: [] },
      // params: { type: Object, default: {} }
    },
    {
      // options
    }
  )

  return User
}
