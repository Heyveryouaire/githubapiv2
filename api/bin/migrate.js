const path = require('path')

require('dotenv').config({
  path: path.join(__dirname, `/../config/${process.env.NODE_ENV ? process.env.NODE_ENV : "dev"}/.env`)
})

process.env.TZ = "Europe/Paris"

const fs = require('fs')

const context = { env: process.env }
const { Migration } = require('../src/db')(context.env.GCLOUD_PROJECT, context.env.GCLOUD_DATASTORE_NAMESPACE)
const argv = require('minimist')(process.argv.slice(2))

let way = "up"

if (argv.down) {
  way = "down"
}

const start = async (way = "up") => {
  const migration = await Migration.list()
  const migrationFiles = getMigrationFiles()

  migrate(migration.entities[0], migrationFiles, way)
}

const migrate = async (migration, migrationFiles, way = "up") => {
  let current_migration = migration ? migration.last_num : -1

  let migrationNum = migrationFiles.findIndex(e => e == current_migration)

  if (way == "up") migrationNum++

  if (migrationFiles[migrationNum] == undefined) {
    console.log('No migration to urn')
    return
  }

  while (migrationFiles[migrationNum] != undefined) {
    // Execute migration up
    await executeMigration(migrationNum, way)
    migration = await updateMigrationNum(migration, migrationNum)
    migration = migration.plain()

    if (way == "up") migrationNum++
    else if (way == "down") {
      migrationNum--
      await updateMigrationNum(migration, migrationNum)
      return
    }
  }
}

const updateMigrationNum = (migration, migrationNum) => {
  if (migration) {
    return Migration.update(migration.id, { last_num: migrationNum })
  }

  const newMigration = new Migration({ last_num: migrationNum })
  return newMigration.save()
}

const executeMigration = (migrationNum, way = "up") => {
  console.log(`Execute migration num ${migrationNum}`)
  const migrationFile = require(path.join(__dirname, '../migrations', `${migrationNum}.js`))

  if (way == "up") {
    return migrationFile.up(context)
  }
  
  return migrationFile.down(context)
}

const getMigrationFiles = () => {
  return fs.readdirSync(path.join(__dirname, '../migrations'))
    .filter(f => {
      const stat = fs.lstatSync(path.join(__dirname, '../migrations', f))
      return !stat.isDirectory()
    })
    .map(e => parseInt(e))
    .sort((a, b) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
}

start(way)
