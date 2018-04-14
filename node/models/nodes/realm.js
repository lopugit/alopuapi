var mongoose = require('mongoose')
dbconf = require('secrets')
dbconf = dbconf.mongodb
let uri = "mongodb://" + (dbconf.auth ? dbconf.username + ":" + dbconf.password + "@" : '') + dbconf.server + ":" + dbconf.port + "/" + dbconf.db + (dbconf.auth ? "?authSource="+dbconf.authDb+"" : '')
let options = { useMongoClient: true }
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