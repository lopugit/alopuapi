var mongoose = require('mongoose')
let secrets = require('secrets')
dbconf = secrets.mongodb
let uri = secrets.mongodb.uri
let options = { useUnifiedTopology: true, useNewUrlParser: true }
let node = mongoose.createConnection(uri, options)
Schema = mongoose.Schema
moment = require('moment')

var sourceSchema = new Schema({
    properties: {
        type: {}
    }
},{
    strict: false
})

var sourceModel = node.model('source', sourceSchema)

module.exports = sourceModel
