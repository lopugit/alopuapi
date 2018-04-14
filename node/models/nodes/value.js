var mongoose = require('mongoose')
dbconf = require('secrets')
dbconf = dbconf.mongodb
let uri = "mongodb://" + (dbconf.auth ? dbconf.username + ":" + dbconf.password + "@" : '') + dbconf.server + ":" + dbconf.port + "/" + dbconf.db + (dbconf.auth ? "?authSource="+dbconf.authDb+"" : '')
let options = { useMongoClient: true }
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

