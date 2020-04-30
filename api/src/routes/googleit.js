//@ts-check
'use strict'

require("dotenv").config()

const router = require('express').Router()
const { Storage } = require("@google-cloud/storage")
const fs = require('fs');

const storage = new Storage()
const bucket = storage.bucket(process.env.bucketName)

module.exports = (context, _middlewares) => {
    
router.post("/", async (req, res, next) => {

        // base64 decode 
        const string = req.body.uri
        const regex = /^data:.+\/(.+);base64,(.*)$/

        const matches = string.match(regex)
        const data = matches[2]
        const buffer = Buffer.from(data, 'base64')
        const fileName = Date.now() + "."
        
        // Extension matcher
        const regexExt = /\.[a-z]+$/i
        const found = req.body.name.match(regexExt)
        const ext = found[0].substring(1)
        
        fs.writeFile(`temp/${fileName}${ext}`, buffer, (err) => {
        if (err) throw err
        console.log("Le fichier à bien été crée ! ", fileName + ext)
        })

        try{
            let url = await uploadFile(fileName, ext)
            res.status(200).json({link: url})
        }catch(err){
            console.log("Impossible de stocker le fichier ", err)
            res.status(400)
        }
        deleteLocalFile(fileName, ext)    
})

/**
 * 
 * @param {string} fileName
 * @param {string} ext 
 */
async function uploadFile(fileName, ext){
    await storage.bucket(bucket.name).upload(`temp/${fileName}${ext}`, {
          gzip: true,
          metadata: {
              cacheControl: "public, max-age=31536000"
          }
      })
      console.log(`The file is now uploaded at https://storage.googleapis.com/${bucket.name}/${fileName}${ext}`)
      return `https://storage.googleapis.com/${bucket.name}/${fileName}${ext}`
  }

  /**
   * 
   * @param {string} fileName 
   * @param {string} ext 
   */
async function deleteLocalFile(fileName, ext){
    fs.unlink(`temp/${fileName}${ext}`, (err) => {
        if (err) throw err
        console.log("Le fichier à bien été supprimé !")
    })
}

return router

    // list files in console
    // router.get("/list", (req, res) => {
    //     async function listFiles(bucketName){
    //         const [files] = await storage.bucket(bucketName).getFiles()
    //         let fileNumber = files.length
    //         let datas = []
    //         if(fileNumber === 0 ){
    //             return "There's no files ! :'("
    //         }else{
    //             files.forEach(file => {
    //                 datas.push({
    //                     name : file.name,
    //                     link : `https://storage.googleapis.com/${bucketName}/${file.name}`,
    //                     size : `${file.metadata.size / 1000 / 1000} mo`,
    //                     createAt : file.metadata.timeCreated
    //                 })      
    //                 console.log(file.name)     
                   
    //             })
    //         }
    //         // return datas
    //         console.log("fin de la liste");
    //         res.send("ok")
    //     }
    //     listFiles(bucket.name)
    // })

    // router.get('/delete', (req, res) => {
    //     try{
    //         async function deleteFile(bucketName, fileName){
    //             await storage
    //                 .bucket(bucketName)
    //                 .file(fileName)
    //                 .delete()
    //         }
    //         deleteFile(bucket.name, "minet.jpg")
    //         console.log("fichier bien effacé"); 
    //     }catch(err){
    //         console.log("impossible d'effacer le fichier");
    //     }
    //     res.send("fichier supprimer")
    // })
}
