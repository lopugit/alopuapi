var mongoose = require('mongoose')
var db = mongoose.createConnection("mongodb://localhost:27017/node214")
Schema = mongoose.Schema
moment = require('moment')

var resourceSchema = new Schema({
    resourceId: { type: Schema.ObjectId, ref: 'resource' },
    names: { type: [String], required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    number: { type: Number, required: false },
    url: { type: String },
    boolean: { type: Boolean },
    realms: { type: [String], default: ["all", "resources"] },
    resources: { type: [{ type: Schema.ObjectId, ref: 'resource' }], default: [] },
    parents: { type: [{type: Schema.ObjectId, ref: 'resource' }], default: [] },
    owner: { type: Schema.ObjectId, ref: 'entity' },
    ownerAlias: { type: String },
    letters: { type: [{ type: Schema.ObjectId, ref: 'entity'}] },
    exists: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    contract: { type: Schema.ObjectId, ref: 'resource' },
    state: { type: Boolean, default: false },
    states: { type: [{ type: Schema.ObjectId, ref: 'resource' }]},
    stateType: { type: String, default: 'permanent' },
    inception: { type: Date, default: Date.now() },
    age: { type: Number, default: 0},
    lifetime: { type: Number, default: 0, min: 0, max: Infinity },
    location: { type: String },
    source: { type: String },
    history: { type: [{ type: Schema.ObjectId, ref: 'resource' }]},
    properties: { type: {}, default: {} }
    //         file: { type: String },
    //         fbData: { type: {} },
    //         twitterData: { type: {} },
    //         redditData: { type: {} },
    //         linkedinData: { type: {} },
    //         youtubeData: { type: {} },
    //         Data: { type: {} },
    //         linkedinData: { type: {} },
    //     } 
    // }
    ,
    uniques: {
        names: { type: Boolean, default: false },
        resource: { type: Boolean, default: false },
        type: { type: Boolean, default: false },
    }
})

var resourceModel = db.model('resource', resourceSchema)

module.exports = resourceModel

function createExampleResources(){
    let resources = [
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
    resourceModel.remove({}, err=>{
        if(err){
            console.log(err)
        } else {
            var loop = 1
            for(let l = 0; l < loop; l++){
                for(let obj of resources){
                    let newObj = new resourceModel({
                        resource: obj,
                        names: [obj],
                        type: 'object'
                    })
                    newObj.save(err=>{
                        if(err){
                            console.error("there was an error saving")
                            console.error(err)
                        } 
                    })
                }
            }
        }
    })
}