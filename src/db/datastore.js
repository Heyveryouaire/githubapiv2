// //@ts-check
// 'use strict'

// const { Gstore, instances } = require('gstore-node');
// const { Datastore } = require('@google-cloud/datastore');

// let gstore

// const init = (projectId, namespace = "dev") => {
//   if (!gstore) {
//     gstore = new Gstore();
//     const datastore = new Datastore({ projectId, namespace })

//     gstore.connect(datastore);



//     // console.log("gstore", gstore)
//     // console.trace
//     // const query = datastore
//     // .createQuery('User')
//     // .filter('token', '=', "kuzYWwZd6Ap8KpVHA0Vw74Oe")

//     // query.run()
//     // .then(res => {
//     // })


//     // Save the gstore instance
//     instances.set('unique-id', gstore);
//   }

//   return gstore
// }

// module.exports = init
