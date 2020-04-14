const fetch = require("node-fetch")

class AbstractGraphql {

    sendRequest() {
        return new Promise((resolve, reject) => {
            this.options.body = JSON.stringify({ query: this.query, variables: this.variables })

            fetch(this.url, this.options)
                .then(rep => rep.json())
                .then((rep) => {
                    resolve(rep)
                })
        }).then(rep => rep)
    }

    setVariables(data) {
        this.variables = {
            input: {
                name: data.name,
                ownerId: data.ownerId,
                visibility: data.visibility
            },
            issue: {
                title: data.title,
                body: data.body,
                repositoryId: data.repositoryId
            },
            commentIssue: {
                subjectId: data.subjectId,
                body: data.body
            },
            updateIssue: {
                id: data.id,
                title: data.title,
                body: data.body
            },
            updateIssueComment: {
                id: data.id,
                body: data.body
            },
            deleteIssueComment: {
                id: data.id
            },
            login: data.login,
            repositoryName: data.repositoryName,
            issueNum: data.issueNum
        }
    }

}

module.exports = AbstractGraphql