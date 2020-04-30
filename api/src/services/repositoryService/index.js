// const CONSTANTS = require('../../lib/constants')
const Graphql = require("../../graphql/Graphql")
let graph = new Graphql()

const init = (context) => {
    const {
        Models: { Repository }
      } = require("../../db-postgresql")(context.env)
      // insert repos into the bdd
      
      // check if the repos is already in the bdd, otherwise add them
      const insertReposDatabase = (githubRepos, dbRepos, userId) => {
        
        githubRepos.forEach(githubRepo => {
            let repoFound = dbRepos.find((dbrepo)=> {
                return dbrepo.name === githubRepo.node.name
            })
            if(!repoFound){
                let newDbRepo = new Repository({
                    name: githubRepo.node.name,
                    userId : userId
                }) 
                newDbRepo.save()
            }
        })
    }

    const syncRepo = (user) => {
        // get user repos in github
        let repositories = graph.queryGetRepos()
        repositories.then( async ( res) => {
            // get user repos in the database
            let repos = await Repository.listBy({ userId: user.id})
            insertReposDatabase(res.data.user.repositories.edges, repos, user.id)
        })
        .catch((err) => {
            console.log("Erreur: ", err)
        })

    }

    return {
        syncRepo
    }
  }

  
  module.exports = init
  