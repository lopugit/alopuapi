var mongoose = require('mongoose')
let secrets = require('secrets')
dbconf = secrets.mongodb
let uri = secrets.mongodb.uri
let options = { useUnifiedTopology: true, useNewUrlParser: true }
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