//@ts-check
'use strict'
const router = require('express').Router()
const Graphql = require("../graphql/Graphql")
let graph = new Graphql()

module.exports = (context, _middlewares) => {

  // QUERY SECTION
  router.get("/", (req, res) => {
    graph.queryRepoId({
      login: process.env.GITHUB_USERNAME,
      repositoryName: "GraphQL2"
    })
      .then(rep => {
        res.send(rep)
      })
  })

  router.get("/issueId", (req, res) => {
    graph.queryIssueId({
      login: process.env.GITHUB_USERNAME,
      repositoryName: "GraphQL2",
      issueNum: 10
    }).then(rep => {
      res.send(rep)
    })
  })


  router.get("/createRepo", (req, res) => {
      graph.mutationCreateRepo({
      name: "test yollo",
      visibility: "PUBLIC",
      login: process.env.GITHUB_USERNAME
    }).then(rep => {
      res.send(rep)
    })
  })

  // it'll be better with frontend to query id
  router.post("/commentIssue", (req, res) => {
    console.log(" mon id", req.body.subjectId)
    console.log("mon message", req.body.message)
    graph.mutationCommentIssue({
      subjectId: req.body.subjectId,
      body: req.body.message
    }).then(rep => {
      res.send(rep)
    })
  })

  router.post("/updateIssue", (req, res) => {
    console.log(req.body)
    graph.mutationUpdateIssue({
      id: req.body.id,
      title: req.body.title,
      body: req.body.body
    }).then(rep => {
      res.status(200).json(rep)
    })
  })

  router.get("/updateIssueComment", (req, res) => {
    graph.mutationUpdateIssueComment({
      id: "MDEyOklzc3VlQ29tbWVudDYwODUwMzc1MQ===",
      body: "Yes sirr"
    }).then(rep => {
      res.send(rep)
    })
  })

  router.get("/deleteIssueComment", (req, res) => {
    graph.mutationDeleteIssueComment({
      id: "MDEyOklzc3VlQ29tbWVudDYwODUwMzc1MQ=="
    }).then(rep => {
      res.send(rep)
    })
  })

  // MUTATION SECTION
  router.post("/createIssue", (req, res) => {    
    graph.mutationCreateIssue({
      title: req.body.title,
      body: req.body.body,
      login: process.env.GITHUB_USERNAME,
      repositoryName: req.body.repositoryName
    }).then(rep => {      
      res.status(200).json(rep)
    })
  })

  router.post("/viewListIssue", (req, res) => {
    graph.queryIssueComment({
      login: process.env.GITHUB_USERNAME,
      repositoryName: req.body.repositoryName,
      issueNum: 4,
      commentsNum: 10
    }).then( rep => {
      // Looking for all issues in the repo
      const ticket = []
      let repositories = rep.data.user.repository.issues.edges
      if(repositories.length > 0){
      
      repositories.forEach(repository => {
        // if(repository.node.comments.edges.length >= 1){ // If there's one comment on the issue
          let ticketIssueTitle = repository.node.title
          let ticketIssueBody = repository.node.body
          let ticketIssueId = repository.node.id
          let comments = repository.node.comments.edges
          let ticketIssueComments = []
          for(let x=0; x< comments.length; x++){ 
            if(comments.hasOwnProperty(x)){
              ticketIssueComments.push({
                body: comments[x].node.body,
                createdAt: comments[x].node.createdAt,
                id: comments[x].node.id
              })
            } 
          }
          let issueName = rep.data.user.repository.name
          ticket.push({ issueName, ticketIssueId, ticketIssueTitle, ticketIssueBody, ticketIssueComments})   
        });
      }else{
        // let issueName = rep.data.user.repository.name
        // ticket.push({ issueName })
      }  
      res.status(200).json(ticket)
    })
    .catch(err => {
      console.log("erreur dans le trouvage du repo :", err)
      // res.status(404).send("Projet non trouvé")
      res.status(200).json({null: true})
    }) 

  })

  
  //   const { MyModel } = require('../db')(context.env.GCLOUD_PROJECT, process.env.GCLOUD_DATASTORE_NAMESPACE)

  //   // Need to be declared after router routes declaration to not override them.
  //   const crudRouter = require('../lib/router/crud')(context, router, MyModel, {

  //     // You can add checking writes middlewares.
  //     // list: [_middlewares.isAuthenticated],

  //     // You can use them as a trigger (executed before the crud router),
  //     // to validate some fields, ...
  //     // update: (req, _res, next) => {
  //     //   req.body.holidays = { start: new Date() }
  //     //   next()
  //     // },
  //   })

  return router
}
