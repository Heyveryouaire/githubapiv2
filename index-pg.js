const path = require("path")

require("dotenv").config({
  path: path.join(__dirname, `/config/${process.env.NODE_ENV}/.env`)
})

const {
  Models: { User, Role },
  db
} = require("./src/db-postgresql")(process.env)

const start = async () => {
  await db.sync({force: true})

  const user = await User.create({
    firstname: "John2",
    lastname: "Hancock",
    email: "ee@ee.ee",
    password: "password"
  })

  const role = await Role.create({
    name: "Admin"
  })

  await user.addRole(role)

  const users = await User.findAll({
    include: [
      {
        model: Role,
        where: { name: "Admin" }
      }
    ]
  })

  console.log(User.rawAttributes)
  // console.log("TCL: start -> users", users)
}

start()
