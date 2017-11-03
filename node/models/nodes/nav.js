var mongoose = require('mongoose')
dbconf = require('secrets')
dbconf = dbconf.mongodb
let uri = "mongodb://" + (dbconf.auth ? dbconf.username + ":" + dbconf.password + "@" : '') + dbconf.server + ":" + dbconf.port + "/" + dbconf.db + (dbconf.auth ? "?authSource=admin" : '')
// let uri = "mongodb://" + dbconf.server + ":" + dbconf.port + "/" + dbconf.db + "?authSource=" + dbconf.authDb
let options = { useMongoClient: true }
let node = mongoose.createConnection(uri, options)
Schema = mongoose.Schema;
moment = require('moment')
let write = false

var navSchema = new Schema({
    siteTitle: {
        type: String,
        required: true,
        unique: false
    },
    actions: {
        type: [{
            type: Schema.ObjectId,
            ref: 'navAction'
        }],
        default: []
    },
    actionGroups: {
        type: [{
            type: Schema.ObjectId,
            ref: 'navAction'
        }],
        default: []
    },
    // navLowerCase: {type: String, required: false, unique: true},
    arbData: {
        type: {},
        default: {}
    }
})
var navModel = node.model('nav', navSchema)

var navActionGroupSchema = new Schema({
    actions: { type: [{ type: Schema.ObjectId }], default: [] }
})
var navActionGroupModel = node.model('actionGroup', navActionGroupSchema)

var navActionSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: null
    },
    render: {
        type: String,
        default: 'text'
    },
    type: {
        type: String,
        default: "link"
    },
    link: {
        type: String
    },
    action: {
        type: String
    },
    auth: {
        type: [String],
        default: ["general"]
    }
})
var navActionModel = node.model('action', navActionSchema)

let navActionGroups = [
    [{
            text: "market",
            type: 'link',
            icon: 'bank',
            render: 'icon',
            link: '/market',
            auth: ["general"]
        },
        {
            text: "forum",
            type: 'link',
            icon: 'group',
            render: 'icon',
            link: '/forum',
            auth: ["general"]
        }
        // ]
        ,
        // [
        {
            text: "login-small",
            type: 'component',
            auth: ["nouser"]
        },
        {
            text: "connections",
            type: 'link',
            // icon: 'connectdevelop',
            icon: 'address-book',
            render: 'icon',
            link: '/connections',
            auth: ["user"]
        },
        {
            text: "notifications",
            type: 'link',
            icon: 'globe',
            render: 'icon',
            link: '/notifications',
            auth: ["user"]
        },
        {
            text: "self",
            type: 'dropdown',
            // icon: 'address-card-o',
            icon: '500px',
            render: 'icon',
            action: 'toggleSideBar',
            link: '/self',
            auth: ["user"]
        }
    ]
]

if (write) {
    navModel.remove({}, err => {
        if (err) {
            console.log(err)
        } else {
            let newNav = new navModel({
                siteTitle: 'agora'
            })
            let actions = []
            navActionModel.remove({}, err => {
                if (err) {
                    console.log(err)
                } else {
                    navActionGroups.forEach((actionGroup, index) => {
                        let newActionGroup = new navActionGroupModel({
                            actions: []
                        })
                        for (let action of actionGroup) {
                            let newAction = new navActionModel(action)
                            newAction.save(err => {
                                if (err) {
                                    console.error("there was an error saving")
                                    console.error(err)
                                }
                                // else {
                                //     console.log("successfully saved")
                                // }
                            })
                            newActionGroup.actions.push(newAction._id)
                        }
                        newNav.actionGroups.push(newActionGroup)
                        newActionGroup.save(err => {
                            if (err) {
                                console.error("there was an error saving")
                                console.error(err)
                            }
                            // else {
                            //     console.log("successfully saved")
                            // }
                        })
                    })
                    newNav.save(err => {
                        if (err) {
                            console.error("there was an error saving")
                            console.error(err)
                        }
                        // else {
                        //     console.log("successfully saved")
                        // }
                    })
                }
            })
        }
    })
}


module.exports = navModel