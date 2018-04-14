var mongoose = require('mongoose')
dbconf = require('secrets')
dbconf = dbconf.mongodb
let uri = "mongodb://" + (dbconf.auth ? dbconf.username + ":" + dbconf.password + "@" : '') + dbconf.server + ":" + dbconf.port + "/" + dbconf.db + (dbconf.auth ? "?authSource="+dbconf.authDb+"" : '')
let options = { useMongoClient: true }
let node = mongoose.createConnection(uri, options)
Schema = mongoose.Schema
moment = require('moment')
mongoose.Promise = require('bluebird')

var thingSchema = new Schema({
  properties: {
      type: {}
  }
},{
    usePushEach: true
})

// define the geojson index
thingSchema.index({'geojson.geometry' : '2dsphere'})

var thingModel = node.model('see', thingSchema)

let newThing = new thingModel({
  properties: {
    username: "unown",
    password: {
      encrypted: 'boo'
    }
  }
})
newThing.save()
.then((thing, err)=>{
  if(!err){
    // console.log(thing)
  }
})

thingModel.findOne({
  'properties.password.encrypted': 'boo',
  'properties.username': 'unown'
})
.then((thing, err)=>{
  if(!err){
    console.log(thing)
  }
})