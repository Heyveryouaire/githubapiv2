const Sequelize = require("sequelize")

module.exports = (sequelize, defaultFields = {}) => {
  const User = sequelize.define(
    "user",
    {
      ...defaultFields,
      // attributes
      firstname: {
        type: Sequelize.STRING,
      },
      lastname: {
        type: Sequelize.STRING,
        // allowNull defaults to true
      },
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true
        },
      },
      password: {
        type: Sequelize.STRING,
        read: false,
        get() {
          return undefined
        }
      },
      username: {
        type: Sequelize.STRING,
      },
      company: { type: Sequelize.STRING, optional: true},
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
