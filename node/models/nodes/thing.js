var mongoose = require('mongoose')
dbconf = require('secrets')
dbconf = dbconf.mongodb
let uri = "mongodb://" + (dbconf.auth ? dbconf.username + ":" + dbconf.password + "@" : '') + dbconf.server + ":" + dbconf.port + "/" + dbconf.db + (dbconf.auth ? "?authSource="+dbconf.authDb+"" : '')
let options = { useMongoClient: true }
let node = mongoose.createConnection(uri, options)
Schema = mongoose.Schema
moment = require('moment')

var relationshipSchema = new Schema({
    relative: { type: Schema.ObjectId, ref: 'thing' },
    path: { type: String }
})

var thingSchema = new Schema({

    // origin Id to relate states when new states are created
    thingId: { type: Schema.ObjectId, ref: 'thing' },
    hash: { type: String },                         
    uuid: { type: String },
    // organzational properties
    title: { type: String },
    titles: { type: [String] },
    names: { type: [String] },
    realms: { type: [String], default: ["all", "things"] },
    description: { type: String },
    // values
    String: { type: String },
    Number: { type: Number },
    url: { type: String },
    // later
    // Thing: { type: Schema.ObjectId, ref: 'thing' },
    Thing: { type: {} },
    json: { type: {} },
    // list: { type: [{type: Schema.ObjectId, ref: 'thing'}] },
    Array: { type: [] },
    'Array of Arrays': { type: [] },
    'Array of Booleans': { type: [{type: Boolean }] },
    'Array of Numbers': { type: [{type: Number }] },
    'Array of Things': { type: [{}] },
    'Array of Strings': { type: [{type: String }] },
    Boolean: { type: Boolean },
    binary: { 
        data: { type: Buffer },
        // binary type .PNG .JPG for decoding if
        extension: { type: String }
    },
    
    // family relations | inventory of other things | child things | states
    relatives: { type: [{ 
            relative: { type: Schema.ObjectId, ref: 'thing' },
            path: {type: String }
        }], 
        default: []
    },
    things:     { type: [{ type: Schema.ObjectId, ref: 'thing' }], default: [] },
    parents:    { type: [{ type: Schema.ObjectId, ref: 'thing' }], default: [] },
    states:     { type: [{ type: Schema.ObjectId, ref: 'thing' }], default: [] },
    properties: { type: [{ type: Schema.ObjectId, ref: 'thing' }], default: [] }, // extendable schema support
    
    // ownership / privacy / access control / billing
    owner: { type: Schema.ObjectId, ref: 'entity' },
    owners: { type: [{ type: Schema.ObjectId, ref: 'entity' }] },
    payees: { type: [{ type: Schema.ObjectId, ref: 'entity' }] },
    
    // smart contract variable/dynamic pricing
    contract: {
        type: [{
            contractType: { type: String, required: true },
            source: { type: Schema.ObjectId, ref: 'entity', required: true },        
            thing: { type: Schema.ObjectId, ref: 'entity', required: true },
            amount: { type: Number, required: true, default: 1 },
            multiplier: { type: Number, required: true, default: 1 },
            unit: { type: String, required: true },
            destination: { type: Schema.ObjectId, ref: 'entity', required: true },        
        }]
    },

    // meta data
    created: { type: Date, default: Date.now() },
    inception: { type: Date, default: Date.now() },
    age: { type: Number, default: 0 },
    lifetime: { type: Number, default: 0, min: 0, max: Infinity },
    geojson: { 
        address: { type: String },
        center: { type: [Number] },
        context: { type: [{}] },
        geometry: {
            type: { type: String, default: "Point"},
            coordinates: { type: [], default: [50,50]}
        },
        id: { type: String },
        place_name: { type: String },
        place_type: { type: [String] },
        text: { type: String },
        type: { type: String },
    },
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
    // state meta data
    stateId: { type: String },
    stateCreated: { type: Date, default: Date.now() },
    backupState: { type: Boolean, default: false }

},{
    usePushEach: true
})

// define the geojson index
thingSchema.index({'geojson.geometry' : '2dsphere'})

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

// let newThing = new thingModel()
// thingModel.findOne({
//     _id: newThing._id
//   })
//   .then(thing=>{
//       console.log(thing)
//   })