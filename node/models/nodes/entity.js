let mongoose = require('mongoose')
let secrets = require('secrets')
dbconf = secrets.mongodb
let uri = secrets.mongodb.uri
let options = { useUnifiedTopology: true, useNewUrlParser: true }
let node = mongoose.createConnection(uri, options)
Schema = mongoose.Schema

// let wishlistInv = new inventory({
//   names: ["wishlist"],
//   unique: {

//   }
// })
// let potentialInv = new inventory({
//   names: "potential"
// })
// let has = new inventory({
//   names: "has"
// })

let entitySchema = new Schema({
    entityName: { type: String, unique: true, index: true, required: true },
    username: { type: String, unique: true, index: true, required: true },
    firstName: { type: String, default: "John" },
    middleName: { type: String, default: undefined },
    lastName: { type: String, default: "Doe" },
    password: { type: String, required: true },
    email: { type: String, required: false, index: true, unique: true, sparse: true, default: undefined },
    inventory: { type: Schema.ObjectId, ref: 'thing' },
    properties: { type: {}, default: {} }
});
let entity = node.model('entity', entitySchema)

module.exports = entity;