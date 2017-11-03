var mongoose = require('mongoose')
var db = mongoose.createConnection("mongodb://127.0.0.1:27017/node214")
Schema = mongoose.Schema
moment = require('moment')

var realmSchema = new Schema({
    realm: {type: String, required: true, unique: true},
    // realmLowerCase: {type: String, required: false, unique: true},
    arbData: {type: {}, default: {}}
})

var realmModel = db.model('realm', realmSchema)

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