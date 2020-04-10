const path = require("path")

require("dotenv").config({
  path: path.join(__dirname, `../config/.env`)
})

if (process.env.NODE_ENV === "production") {
  console.log("PRODUCTION CAN'T BE INIT")
  process.exit()
}

const {  db } = require("../src/db-postgresql")(
  process.env
)

const start = async () => {
  console.log("Reinit db...")

  await db.sync({ force: true })
  
  console.log("Done")
}

start()
