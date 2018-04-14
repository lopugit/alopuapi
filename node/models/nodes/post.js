var mongoose = require('mongoose')
dbconf = require('secrets')
dbconf = dbconf.mongodb
let uri = "mongodb://" + (dbconf.auth ? dbconf.username + ":" + dbconf.password + "@" : '') + dbconf.server + ":" + dbconf.port + "/" + dbconf.db + (dbconf.auth ? "?authSource="+dbconf.authDb+"" : '')
let options = { useMongoClient: true }
let node = mongoose.createConnection(uri, options)
mongoose.Promise = require('bluebird')
var Schema = mongoose.Schema

var postSchema = new Schema({
    type: { type: String, default: "unknown" },
    data: { type: {}, default: null },
    id: { type: String },
    comments: {
        data: { type: [{ type: Schema.ObjectId, ref: 'post' }], default: [], ref: 'post' },
        history: {
            type: [
                []
            ],
            default: []
        }
    },
    sharedposts: {
        data: { type: [{}], default: [] },
        history: {
            type: [
                {}
            ],
            default: []
        }
    },
    likes: {
        data: { type: [{}], default: [] },
        history: {
            type: [
                {}
            ],
            default: []
        }
    },
    reactions: {
        data: { type: [{}], default: [] },
        history: {
            type: [
                {}
            ],
            default: []
        }
    },
    attachments: {
        data: { type: [String], default: [] },
        history: {
            type: [
                {}
            ],
            default: []
        }
    },
    saves: {
        data: { type: [{}], default: [] },
        history: {
            type: [
                {}
            ],
            default: []
        }
    },
    balance: { type: Number, default: 50, min: 0, max: 100 },
    politcal: { type: Number, default: 50, min: 0, max: 100 },
    consciousness: { type: Number, default: 0, min: 0, max: 100 },
    intelligence: { type: Number, default: 0, min: 0, max: 100 },
    frequency: { type: Number, default: 0, min: 0, max: 50000 },
    philosophical: { type: Number, default: 0, min: 0, max: 100 },
    realm: { type: String, default: null },
    realms: { type: [String], default: ["all", "post"] },
    globalImportance: { type: Number, default: 0, min: 0, max: 100 },
    userImportance: { type: Number, default: 0, min: 0, max: 100 },
    image: { type: String, default: null },
    fbData: { type: {}, default: null },
    history: { type: [{}], default: [] },
    commenters: { type: [{}], default: [] },
    lastUpdate: { type: String, default: Date.now() },
    contentType: { type: String, default: 'statement' },
    thing: { type: Schema.ObjectId, ref: 'thing' }
})
var postModel = node.model('post', postSchema)


// var postTypeSchema = new Schema({
//     general: {type: String, required: true},

// })
module.exports = postModel