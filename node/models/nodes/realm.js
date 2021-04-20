var mongoose = require('mongoose')
let secrets = require('secrets')
dbconf = secrets.mongodb
let uri = secrets.mongodb.uri
let options = { useUnifiedTopology: true, useNewUrlParser: true }
let node = mongoose.createConnection(uri, options)
Schema = mongoose.Schema
moment = require('moment')

var realmSchema = new Schema({
    realm: {type: String, required: true, unique: true},
    // realmLowerCase: {type: String, required: false, unique: true},
    arbData: {type: {}, default: {}}
})

var realmModel = node.model('realm', realmSchema)

// realmModel.remove({}, err=>{
//     if(err){
//         console.log(err)
//     } else {
//         var firstRealm = new realmModel({
//             realm: 'realms'
//         })
//         firstRealm.save(err=>{
//             if(err){
//                 console.error("there was an error saving")
//                 console.error(err)
//             }
//         })
//         var philosophyRealm = new realmModel({
//             realm: 'philosophy'
//         })
//         philosophyRealm.save(err=>{
//             if(err){
//                 console.error("there was an error saving")
//                 console.error(err)
//             }
//         })
//         var beanRealm = new realmModel({
//             realm: 'beans'
//         })
//         beanRealm.save(err=>{
//             if(err){
//                 console.error("there was an error saving")
//                 console.error(err)
//             }
//         })
//     }
// })

module.exports = realmModel