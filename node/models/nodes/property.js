var mongoose = require('mongoose')
dbconf = require('secrets')
dbconf = dbconf.mongodb
let uri = "mongodb://" + (dbconf.auth ? dbconf.username + ":" + dbconf.password + "@" : '') + dbconf.server + ":" + dbconf.port + "/" + dbconf.db + (dbconf.auth ? "?authSource="+dbconf.authDb+"" : '')
let options = { useMongoClient: true }
let node = mongoose.createConnection(uri, options)
Schema = mongoose.Schema
moment = require('moment')

var propertySchema = new Schema({
    title: String,
    value: { type: Schema.ObjectId, ref: 'value' },
    type: { 
        type: Schema.Types.Mixed, 
        enum: [
            Array,
            Boolean,
            Number,
            Object,
            String,
            [Array],
            [Boolean],
            [Number],
            [Object],
            [String],
            {Array},
            {Boolean},
            {Number},
            {Object},
            {String},
            'Array',
            'Boolean',
            'Number',
            'Object',
            'String',
            'Array of Arrays',
            'Array of Booleans',
            'Array of Numbers',
            'Array of Objects',
            'Array of Strings',
            'Object of Arrays',
            'Object of Booleans',
            'Object of Numbers',
            'Object of Objects',
            'Object of Strings',
            '',
            undefined,
            null,
            {},
            [{}],
            {Array: []},
        ]
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
propertySchema.index({'geojson.geometry' : '2dsphere'})

var propertyModel = node.model('property', propertySchema)

module.exports = propertyModel

function createExampleThings() {
    let things = [
        "knife",
        "spoon",
        "fork",
        "plate",
        "dehydrator",
        "tissues",
        "cereal",
        "milk",
        "chocolate",
        "plant",
        "chainsaw",
        "garden shears",
        "rake",
        "lawn mower",
        "high pressure hose",
        "paint brush",
        "water bottle",
        "mobile phone",
        "laptop",
        "computer",
        "flashlight",
        "car",
        "house",
        "bed",
        "room",
        "stove",
        "land",
        "tomato",
        "zuchini",
        "potato",
        "cauliflower"
    ]
    propertyModel.remove({}, err => {
        if (err) {
            console.log(err)
        } else {
            var loop = 1
            for (let l = 0; l < loop; l++) {
                for (let obj of things) {
                    let newObj = new propertyModel({
                        thing: obj,
                        names: [obj],
                        type: 'object'
                    })
                    newObj.save(err => {
                        if (err) {
                            console.error("there was an error saving")
                            console.error(err)
                        }
                    })
                }
            }
        }
    })
}

// let newThing = new propertyModel()
// propertyModel.findOne({
//     _id: newThing._id
//   })
//   .then(thing=>{
//       console.log(thing)
//   })