const path = require("path")

require("dotenv").config({
    path: path.join(__dirname, `/config/.env`)
  })

const fetch = require("node-fetch")
const AbstractGraphql = require("./AbstractGraphql")

class Graphql extends AbstractGraphql{

    constructor() {
        super()
        this.url = "https://api.github.com/graphql"
        this.options = { 
            method : "POST",
            headers : {
                "Content-type" : "application/json",
                "Authorization" : process.env.GITHUB_AUTHORIZATION
            }
        }
    }

    /*********
     * 
     * QUERY BLOCK
     * 
     */


    /**
     * @param {object} data : Waiting for login and repositoryName 
     * 
     */
    queryRepoId(data) {
        return new Promise((resolve, reject) => {
            this.query = `
                query queryRepoId($login : String!, $repositoryName : String!){
                    user(login: $login){
                        repository(name: $repositoryName){
                            id
                        }
                    }
                }
            `
            this.setVariables(data)
            resolve()
        }).then(() => {
            return this.sendRequest()
        })
    }

    /**
     * 
     * @param {object} data : Waiting for login, repositoryName and issueNum 
     */
    queryIssueId(data) {
        return new Promise((resolve, reject) => {

            this.query = `
            query queryIssueId($login: String!, $repositoryName: String!, $issueNum: Int!){
                user(login : $login){
                    repository(name: $repositoryName){
                        issues(first: $issueNum){
                            edges{
                                node{
                                    title,
                                    id
                                }
                            }
                        }
                    }
                }  
            }
        `
            this.setVariables(data)
            resolve()
        }).then(() => {
            return this.sendRequest()
        })
    }

    queryIssueIdComment(data) {

    }


    queryUserId(data) {
        return new Promise((resolve, reject) => {
            this.query = `
            query getUser($login: String!){
                user(login: $login){
                    id
                }
            }
            `
            this.setVariables(data)
            this.sendRequest()

            fetch(this.url, this.options)
                .then(rep => rep.json())
                .then(rep => {
                    this.options.body = ""
                    resolve(rep.data.user.id)
            })
        })
    }

    /**
     * 
     * @param {string} login: github username
     * @param {string} repositoryName: name of the repo 
     * @param {int} issueNum: number of issue to return 
     * @param {int} commentsNum: number of comments to return
     */
    queryIssueComment(data) {
        return new Promise((resolve, reject) => {
            this.query = `
            query queryIssueComment($login: String!, $repositoryName: String!, $issueNum: Int!, $commentsNum: Int! ){ 
                user(login:$login){
                  repository(name: $repositoryName){
                    name,
                    issues(last: $issueNum){
                      edges{
                        node{
                          title,
                          body,
                          id,
                          comments(last: $commentsNum){
                            edges{
                              node{
                                body,
                                createdAt,
                                id
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
        `
                this.setVariables(data)   
                resolve()       
        }).then(() => {
            console.log("query ok")
            return this.sendRequest()
        })
    }



    /**
 * 
 * MUTATION BLOCK
 *  
 */


    /**
     * 
     * @param {object} data : Waiting for name, ownerId and visibility
     * 
     */
    mutationCreateRepo(data) {
        return new Promise((resolve, reject) => {
            this.queryUserId({ login: data.login })
                .then((id) => {
                    resolve(id)
                })
        }).then((id) => {
            data.ownerId = id
            this.query = `
                mutation createRepo($input: CreateRepositoryInput!){
                    createRepository(input: $input ) {
                        repository{
                            name
                            }
                        }
                    }
            `
            this.setVariables(data)
            return this.sendRequest()
        })
    }

    /**
     * 
     * @param {object} data : Waiting for title, body and repositoryId
     */
    mutationCreateIssue(data) {
        return new Promise((resolve, reject) => {
            this.queryRepoId({ login : data.login , repositoryName : data.repositoryName})
            .then(rep => {
                if(rep.data.user.repository == null){
                    reject("Cannot find the repository for this account")
                }
                resolve(rep)
                
            }).catch((err) => {
                console.log(err);
            })
        }).then((id) => {
                data.repositoryId = id.data.user.repository.id
                this.query = `
                mutation createissue($issue: CreateIssueInput!){
                    createIssue(input: $issue){
                        issue{
                            title,
                        body
                    }
                }
            }
            `
        }).then(() => {
            this.setVariables(data)
        })
        .then(() => {
            console.log("Query looks like to works fine !");
            return this.sendRequest()
        })

    }

    /**
     * 
     * @param {object} data : Waiting for subjectId and body
     */
    mutationCommentIssue(data) {
        return new Promise((resolve, reject) => {

            this.query = `
            mutation commentIssue($commentIssue : AddCommentInput!){
                addComment(input : $commentIssue){
                    subject{
                        id
                    },
                    commentEdge{
                        node{
                            body
                        }
                    }
                }
            }
            `
            this.setVariables(data)
            resolve()
        }).then(() => {
            return this.sendRequest()
        })
    }

    /**
     * 
     * @param {object} data : Waiting for id, title, body 
     */
    mutationUpdateIssue(data) {
        return new Promise((resolve, reject) => {

            this.query = `
            mutation updateIssue($updateIssue: UpdateIssueInput!){
                updateIssue(input : $updateIssue){
                    issue{
                        title, body
                    }
                }
            }
            `
            this.setVariables(data)
            resolve()
        }).then(() => {
            return this.sendRequest()
        })
    }

    /**
     * 
     * @param {object} data : Waiting for id and body
     */
    mutationUpdateIssueComment(data) {
        return new Promise((resolve, reject) => {

            this.query = `
            mutation updateissuecomment ($updateIssueComment: UpdateIssueCommentInput ! ){
                updateIssueComment(input : $updateIssueComment){
                    issueComment{
                        body
                    }
                }
            }
            `
            this.setVariables(data)
            resolve()
        }).then(() => {
            return this.sendRequest()
        })
    }

    /**
     * 
     * @param {object} data : Waiting for id 
     */
    mutationDeleteIssueComment(data) {
        return new Promise((resolve, reject) => {

            this.query = `
            mutation delissuecomment ($deleteIssueComment : DeleteIssueCommentInput !){
                deleteIssueComment(input : $deleteIssueComment){
                    clientMutationId
                }
            }
            `
            this.setVariables(data)
            resolve()
        }).then(() => {
            return this.sendRequest()
        })
    }


    queryGetRepos(){
        return new Promise((resolve, reject) => {
            let data = { name : process.env.GITHUB_USERNAME}
            this.query = `
            query getRepos ($name: String!){
                user(login: $name){
                  repositories(last:100){
                    edges{
                      node{
                        name
                      }
                    }
                  }
                }
              }
         `
         this.setVariables(data)
         resolve()
     }).then(() => {
         return this.sendRequest()
     })
 }

}

module.exports = Graphql