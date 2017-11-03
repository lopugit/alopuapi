var mongoose = require('mongoose')
dbconf = require('secrets')
dbconf = dbconf.mongodb
let uri = "mongodb://" + (dbconf.auth ? dbconf.username + ":" + dbconf.password + "@" : '') + dbconf.server + ":" + dbconf.port + "/" + dbconf.db + (dbconf.auth ? "?authSource=admin" : '')
let options = { useMongoClient: true }
let node = mongoose.createConnection(uri, options)
Schema = mongoose.Schema
moment = require('moment')

var thingSchema = new Schema({

    // origin Id to relate states when new states are created
    trueId: { type: Schema.ObjectId, ref: 'thing' },
    
    // organzational properties
    title: { type: String },
    names: { type: [String] },
    realms: { type: [String], default: ["all", "things"] },

    // values
    text: { type: String },
    number: { type: Number },
    url: { type: String },
    json: { type: {} },
    list: { type: [] },
    boolean: { type: Boolean },
    binary: { 
        data: { type: Buffer },
        // binary type .PNG .JPG for decoding if
        extension: { type: String }
    },

    // family relations | inventory of other things | child things
    things: { type: [{ type: Schema.ObjectId, ref: 'thing' }], default: [] },
    parents: { type: [{ type: Schema.ObjectId, ref: 'thing' }], default: [] },
    
    // ownership / privacy / access control / billing
    owner: { type: Schema.ObjectId, ref: 'entity' },
    owners: { type: [{ type: Schema.ObjectId, ref: 'entity' }] },
    payees: { type: [{ type: Schema.ObjectId, ref: 'entity' }] },
    
    // smart contract variable/dynamic pricing
    contract: {
        type: [{
            type: { type: String, required: true },
            thing: { type: Schema.ObjectId, ref: 'entity', required: true },
            amount: { type: Number, required: true, default: 1 },
            multiplier: { type: Number, required: true, default: 1 },
            unit: { type: String, required: true }
        }]
    },

    // meta data
    created: { type: Date, default: Date.now() },
    inception: { type: Date, default: Date.now() },
    age: { type: Number, default: 0 },
    lifetime: { type: Number, default: 0, min: 0, max: Infinity },
    location: { type: String },
    type: { type: String, enum: [
        String,
        Object,
        Number,
        Array,
        ]
    },

    // extendable schema
    properties: { type: [{ type: Schema.ObjectId, ref: 'thing' }], default: [] },
},{
    usePushEach: true
})

var thingModel = node.model('thing', thingSchema)

module.exports = thingModel

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
    thingModel.remove({}, err => {
        if (err) {
            console.log(err)
        } else {
            var loop = 1
            for (let l = 0; l < loop; l++) {
                for (let obj of things) {
                    let newObj = new thingModel({
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