var mongoose = require('mongoose')
let secrets = require('secrets')
dbconf = secrets.mongodb
let uri = secrets.mongodb.uri
let options = { useUnifiedTopology: true, useNewUrlParser: true }
let node = mongoose.createConnection(uri, options)
Schema = mongoose.Schema
moment = require('moment')

var valueSchema = new Schema({
    return: { type: {} },
    store: { 
        type: {}
    },
    properties: {
        type: [
            {
                type: Schema.ObjectId,
                ref: 'property'
            }
        ]
    }
},{
    usePushEach: true
})

// define the geojson index
// valueSchema.index({'geojson.geometry' : '2dsphere'})

var valueModel = node.model('value', valueSchema)

module.exports = valueModel

