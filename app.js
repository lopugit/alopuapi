let compression = require('compression')
let express = require("express")
let app = express()
app.use(compression())
fs = require('fs')
path = require('path')
bodyParser = require('body-parser')
url = require('url')
nodemailer = require('nodemailer')
pug = require('pug')
let http = require('http').Server(app)
// var io = require('socket.io')(http)
let io = require('socket.io')(http, {
    origins: 'uberagora.dev:* uberagoraserver.dev:* http://uberagora.dev:* uberagora.dev:* uberagora.dev:*'
})
// io.origins(['*:*'])
let session = require('express-session')
bcrypt = require('bcryptjs')
moment = require('moment')
RedisStore = require('connect-redis')(session)
conf = require('./conf/conf.js')
secretConf = require('./conf/secrets.js')
logs = {}
// emailConf = require('./conf/email')
//Set App Local Variables
app.locals.deploy = "local"
///// SET BODY PARSER CONFIG
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))
//ENABLE CORS
app.all('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "agora.dev");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
/// SET SESSION CONFIG
app.use(
    session({
        name: "agora.sid",
        secret: secretConf.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: new RedisStore({
            host: 'localhost',
            port: 6379,
            ttl: 260
        })
    })
)
//// SET VIEW ENGINE PUG/JADE
app.set('view engine', 'pug')
//// Allows use of /snippets and absolute paths in jade includes
app.locals.basedir = path.join(__dirname, 'views')
/////// MONGODB AND MONGOOSE THINGS
let MongoClient = require('mongodb')
mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
let dbNode = mongoose.createConnection("mongodb://localhost:27017/node214")
////////// LOAD MODELS
let postModel = require('./models/nodes/posts.js')
realmModel = require('./models/nodes/realms.js')
resourceModel = require('./models/nodes/resources.js')
navModel = require('./models/nodes/navs.js')
entityModel = require('./models/nodes/entities.js')

/// API ROUTES
app.get('/', (req, res) => {
    res.send('woo')
})
app.post('/api/posts', (req, res) => {
    /*
        Takes the following @params
        @param count is the number of posts you want
        @param realm is the realm you want the posts from
        @param [realms] is a list of realms you want the posts from
        @param sort is the value by which you want to sort
        @param sortDirection is the direction/pattern you want to sort in (if undefined it will always be descending)
        @param includeComments is a boolean which defines whether you want to include comment data with the posts
        @param commentSort is the value by which you want to sort Comments
        @param commentSortDirection is the direction/pattern you want to sort comments in (if undefined it will always be descending)
    */
    if (!req.query.count) {
        res.send("you need to provide a count for how many posts you want")
    }
    if (!req.query.count) {
        res.send("you need to provide a count for how many posts you want")
    }
    if (!req.query.count) {
        res.send("you need to provide a count for how many posts you want")
    }
    if (!req.query.count) {
        res.send("you need to provide a count for how many posts you want")
    }

})
logs.connections = []
io.on('connection', function (socket) {
    logs.connections.push(socket);
    console.log("new socket created, sockets: %s", logs.connections.length);
    socket.on('disconnect', function (data) {
        logs.connections.splice(logs.connections.indexOf(socket), 1)
        console.log("lost connection, connections: " + logs.connections.length);
    })

    /// SOCKET EVENT HANDLERS

    // content
    socket.on('getRealms', (opts) => {
        // var res = {};
        if (!opts) {
            let opts = {}
        }
        /*
            Takes the following @params
            @param count is the number of posts you want
            @param realm is the realm you want the posts from
            @param [realms] is a list of realms you want the posts from
            @param sort is the value by which you want to sort
            @param sortDirection is the direction/pattern you want to sort in (if undefined it will always be descending)
            @param includeComments is a boolean which defines whether you want to include comment data with the posts
            @param commentSort is the value by which you want to sort Comments
            @param commentSortDirection is the direction/pattern you want to sort comments in (if undefined it will always be descending)
        */
        // Defaults
        var defaultOpts = {
            count: 50,
            find: {},
            sort: 'alphabetical',
            sortDirection: 'ascending'
        }
        opts = jsonConcat(defaultOpts, opts, true)
        if (opts.sort == 'alphabetical') {
            opts.sortNormal = 'realm'
        } else {
            opts.sortNormal = 'realm'
        }
        if (opts.sortDirection == 'ascending') {
            opts.sortDirectionNormal = 1
        } else if (opts.sortDirection == 'descending') {
            opts.sortDirectionNormal = -1
        } else {
            opts.sortDirectionNormal = 1
        }
        realmModel.find(opts.find).limit(opts.count).sort({
            realm: opts.sortDirectionNormal
        }).then(function (realms) {
            let ret = {
                id: opts.id,
                realms: realms
            }
            console.log(ret)
            socket.emit('giveRealms', ret)
        })
    })
    socket.on('getResource', (opts)=>{
        if(opts.resource && opts.resource._id){
            resourceModel.findOne({_id: opts.resource._id})
                .then(resource=>{
                    console.log('resource')
                    console.log(resource)
                    let ret = {
                        id: opts.id,
                        resource
                    }
                    socket.emit('giveResource', ret)
                })
        }
    })
    socket.on('getResources', (opts) => {
        // var res = {};
        if (!opts) {
            let opts = {}
        }
        /*
            Takes the following @params
            @param count is the number of posts you want
            @param object is the object you want the posts from
            @param [resources] is a list of resources you want the posts from
            @param sort is the value by which you want to sort
            @param sortDirection is the direction/pattern you want to sort in (if undefined it will always be descending)
            @param includeComments is a boolean which defines whether you want to include comment data with the posts
            @param commentSort is the value by which you want to sort Comments
            @param commentSortDirection is the direction/pattern you want to sort comments in (if undefined it will always be descending)
        */
        // Defaults
        var defaultOpts = {
            count: 100,
            sort: 'alphabetical',
            sortDirection: 'ascending',
            find: {
                realms: {$all: ["posts"]}
            },
            checkEdges: false,
            stream: true
        }
        opts = jsonConcat(defaultOpts, opts, true)
        if (opts.sort == 'alphabetical') {
            opts.sortNormal = 'object'
        } else {
            opts.sortNormal = 'object'
        }
        if (opts.sortDirection == 'ascending') {
            opts.sortDirectionNormal = 1
        } else if (opts.sortDirection == 'descending') {
            opts.sortDirectionNormal = -1
        } else {
            opts.sortDirectionNormal = 1
        }
        if(opts.checkEdges){
            var inventoryMatch = []
            for(let source of conf.sources){
                for(let edge of source.edges){
                    inventoryMatch.push(source.source+ ' '+ edge)
                }
            }
        } else {
            var inventoryMatch = []
        }
        let sortString = opts.sortNormal
        // console.log('opts.find')
        // console.log(opts.find)
        if(opts.stream){
            var streamIndex = 0
            if(opts.count !== Infinity){
                resourceModel.find(opts.find)
                .limit(opts.count)
                .sort({
                    sortString: opts.sortDirectionNormal
                })
                .cursor()
                .on('data', function (resource) {
                    let ret = {
                        inventoryId: opts.inventoryId,
                        resource,
                        index: streamIndex++
                    }
                    console.log(opts.find)
                    console.log(resource)
                    socket.emit('giveResource', ret)
                })
                .on('error', function (err) {
                    console.error("there was an error in the stream")
                    console.error(err)
                })
                .on('close', function () {
                    socket.emit('giveResources', {
                        inventoryId: opts.inventoryId,
                        resources: []
                    })
                })
            } else {
                resourceModel.find(opts.find)
                .sort({
                    sortString: opts.sortDirectionNormal
                })
                .cursor()
                .on('data', function (resource) {
                    let ret = {
                        inventoryId: opts.inventoryId,
                        resource,
                        index: streamIndex++
                    }
                    console.log(opts.find)
                    console.log(resource)
                    socket.emit('giveResource', ret)
                })
                .on('error', function (err) {
                    console.error("there was an error in the stream")
                    console.error(err)
                })
                .on('close', function () {
                    socket.emit('giveResources', {
                        inventoryId: opts.inventoryId,
                        resources: []
                    })
                })
            }
        } else {
            if(opts.count !== Infinity){
                resourceModel.find(opts.find)
                .limit(opts.count)
                .sort({
                    sortString: opts.sortDirectionNormal
                }).then(function (resources) {
                    let ret = {
                        inventoryId: opts.inventoryId,
                        resources: resources
                    }
                    if(resources.length > 0){
                        if(opts.stream){
                            resources.forEach((resource, index)=>{
                                let ret = {
                                    inventoryId: opts.inventoryId,
                                    resource,
                                    index,
                                    count: resources.length
                                }
                                socket.emit('giveResource', ret)
                            })
                        } else {
                            socket.emit('giveResources', ret)
                        }
                    } else {
                        socket.emit('giveResources', ret)
                    }
                })
            } else {
                resourceModel.find(opts.find)
                .sort({
                    sortString: opts.sortDirectionNormal
                }).then(function (resources) {
                    let ret = {
                        inventoryId: opts.inventoryId,
                        resources: resources
                    }
                    if(resources.length > 0){
                        if(opts.stream){
                            resources.forEach((resource, index)=>{
                                let ret = {
                                    inventoryId: opts.inventoryId,
                                    resource,
                                    index,
                                    count: resources.length
                                }
                                socket.emit('giveResource', ret)
                            })
                        } else {
                            socket.emit('giveResources', ret)
                        }
                    } else {
                        socket.emit('giveResources', ret)
                    }
                })
            }
        }
    })
    socket.on('saveResource', (opts)=>{
        if(opts.resource && opts.resource._id) { 
            // PARSE ALL REALMS TO STRINGS AND ADD HARD CODE REALMS
            /**
             *  IN THE FUTURE WE NEED TO SAVE ALL UNSAVED REALMS AS REALM
             *  DOCUMENTS, AND THEN STORE THEM AS ID'S AND NOT STRINGS
             */
            opts.resource.realms = opts.resource.realms || []
            opts.resource.realms.forEach((realm,index)=>{
                if(realm && realm.realm){
                    opts.resource.realms[index] = realm.realm
                }
            })
            conf.hardRealms.forEach(hardRealm=>{
                if(!opts.resource.names.includes(hardRealm)){
                    opts.resource.realms.push(hardRealm)
                }
            })
            // PARSE ALL RESOURCE NAMES TO STRINGS
            /**
             *  IN THE FUTURE WE NEED TO SAVE ALL UNSAVED NAMES AS RESOURCE
             *  DOCUMENTS, AND THEN STORE THEM AS ID'S AND NOT STRINGS
             */
            opts.resource.names = opts.resource.names || []
            opts.resource.names.forEach((name,index)=>{
                if(name && name.name){
                    opts.resource.names[index] = name.name
                }
            })
            resourceModel.findOne({_id: opts.resource._id})
                .then((resource, err)=>{
                    if(!err){
                        if(resource){
                            jsonConcat(resource, opts.resource)
                            resource.save((err)=>{
                                if(err){
                                    console.error('there was an error saving the new resource')
                                    console.error(opts.resource)
                                    console.error(err)
                                    opts.feedback = 'something went wrong saving'
                                    socket.emit('giveResource', opts)
                                } else {
                                    opts.feedback = 'successfully saved'
                                    opts.resource = resource
                                    socket.emit('giveResource', opts)
                                    console.error('successfully saved the resource')
                                    console.error(opts.resource._id)
                                    console.error('this one')
                                    opts.resource.parents.forEach(parent=>{
                                        resourceModel.findOne({_id: parent})
                                            .then((resourceParent, err)=>{
                                                if(!err){
                                                    if(resourceParent.resources.indexOf(opts.resource._id) < 0){
                                                        resourceParent.resources.push(opts.resource._id)
                                                        resourceParent.save(err=>{
                                                            if(err){
                                                                console.error(err)
                                                            } else {
                                                                console.error('success')
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    console.log(err)
                                                }
                                            })
                                    })
                                }
                            })
                        } else {
                            saveNewResource(opts, socket)
                        }

                    } else {
                        console.log(err)
                    }
                })
                        
        } else if(opts.resource && !opts.resource._id) {
            saveNewResource(opts, socket)
        }
    })
    socket.on('deleteResource', (opts)=>{
        console.log(opts)
        if(opts.resource && opts.resource._id && opts.resource.owner == opts.entity._id){
            console.log('equalled')
            resourceModel.findOne({_id: opts.resource._id})
                .then((resource, err)=>{
                    if(!err && resource){
                        entityModel.findOne({username: 'agora'})
                            .then((agora, err)=>{
                                if(!err && agora){
                                    resource.owner = agora._id
                                    resource.parents = []
                                    resource.stateType = 'deleted'
                                    resource.save(err=>{
                                        if(err){
                                            console.log(err)
                                        } else {
                                            console.log('saved as')
                                            console.log(resource)
                                            opts.inventoryId = undefined
                                            opts.resource = resource
                                            socket.emit('giveResource', opts)
                                            resourceModel.find({
                                                resources: {$in: [resource._id]}
                                            })
                                            .then((resources, err)=>{
                                                if(!err && resources){
                                                    resources.forEach((inv, index)=>{
                                                        if(inv.resources.indexOf(resource._id) >= 0){
                                                            inv.resources.splice(inv.resources.indexOf(resource._id), 1)
                                                        }
                                                        inv.save(err=>{
                                                            if(err){
                                                                console.log(err)
                                                            } else {
                                                                opts.inventoryId = inv._id
                                                                socket.emit('confirmResourceDeletion', opts)
                                                            }
                                                        })
                                                    })
                                                } else {
                                                    console.log(err)
                                                }
                                            })
                                            .catch(err=>{
                                                console.error(err)
                                            })
                                        }
                                    })
                                } else {
                                    console.error('something went wrong')
                                    console.error(err)
                                }
                            })
                            .catch(err=>{
                                console.error(err)
                            })
                    } else {
                        console.error('something went wrong')
                        console.error(err)
                    }
                })
                .catch(err=>{
                    console.error(err)
                })
        }
    })
    //site data
    socket.on('getNav', (opts) => {
        // var res = {};
        if (!opts) {
            let opts = {}
        }
        /*
            Takes the following @params
            @param count is the number of posts you want
            @param object is the object you want the posts from
            @param [objects] is a list of objects you want the posts from
            @param sort is the value by which you want to sort
            @param sortDirection is the direction/pattern you want to sort in (if undefined it will always be descending)
            @param includeComments is a boolean which defines whether you want to include comment data with the posts
            @param commentSort is the value by which you want to sort Comments
            @param commentSortDirection is the direction/pattern you want to sort comments in (if undefined it will always be descending)
        */
        // Defaults
        var defaultOpts = {
            auth: 'general'
        }
        opts = jsonConcat(defaultOpts, opts, true)
        navModel.findOne({
                siteTitle: opts.siteTitle
            })
            .populate({
                path: 'actionGroups',
                model: 'actionGroup',
                populate: {
                    path: 'actions',
                    model: 'action'
                }
            })
            .then(function (nav) {
                let ret = {
                    id: opts.id,
                    nav: nav
                }
                // console.log(ret)
                socket.emit('giveNav', ret)
            })
    })

    // Authentication
    socket.on('login', (credentials) => {
        if (!credentials) {
            let err = "you didn't provide any credentials....."
            socket.emit('giveAuthenticate', {
                auth: false,
                reason: 'error',
                msg: err,
                err: err
            })
        } else {
            entityModel.findOne({
                $or: [{
                        username: credentials.username
                    },
                    {
                        email: credentials.email
                    }
                ]
            }, (err, entity) => {
                if (err) {
                    socket.emit('giveAuthenticate', {
                        auth: false,
                        reason: 'error',
                        msg: 'an error occured on the server side... sorry for the mistake',
                        err: err
                    })
                    socket.emit('giveLogin', {
                        success: false,
                        msg: 'there was an error',
                        err: err
                    })
                } else if (!entity) {
                    socket.emit('giveAuthenticate', {
                        auth: false,
                        reason: 'no user',
                        err: 'we could not find you in our database, please register'
                    })
                    socket.emit('giveLogin', {
                        success: false,
                        msg: 'the username does not match any on record',
                        err: 'the username does not match any on record'
                    })

                } else if (bcrypt.compareSync(credentials.password, entity.password)) {
                    delete entity.password
                    socket.emit('giveAuthenticate', {
                        auth: true,
                        entity: entity.toJSON()
                    })
                    socket.emit('giveLogin', {
                        success: true,
                        msg: 'successfully logged in',
                        err: null
                    })
                } else {
                    let err = "your password was wrong, please try again"
                    socket.emit('giveAuthenticate', {
                        auth: false,
                        reason: 'error',
                        msg: err,
                        err: err
                    })
                    socket.emit('giveLogin', {
                        success: false,
                        msg: 'your password did not match',
                        err: 'your password did not match'
                    })
                }
            })
        }
    })
    socket.on('register', (credentials) => {
        if (!credentials) {
            let err = "you didn't provide any credentials....."
            socket.emit('giveRegister', {
                auth: false,
                reason: 'error',
                msg: err,
                err: err
            })
        } else {
            entityModel.findOne({
                $or: [{
                        username: credentials.username
                    },
                    {
                        email: credentials.email ? credentials.email : ''
                    }
                ]
            }, (err, entity) => {
                if (err) {
                    socket.emit('giveRegister', {
                        success: false,
                        reason: 'error',
                        msg: 'an error occured on the server side... sorry for the mistake',
                        err: err
                    })
                } else if (!entity) {
                    var hash = bcrypt.hashSync(credentials.password, bcrypt.genSaltSync(12))
                    let entityNew = new entityModel({
                        firstName: credentials.firstName ? credentials.firstName.toLowerCase() : undefined,
                        middleName: credentials.middleName ? credentials.middleName.toLowerCase() : undefined,
                        lastName: credentials.lastName ? credentials.firstName.toLowerCase() : undefined,
                        username: credentials.username,
                        entityName: credentials.username,
                        password: hash,
                        email: credentials.email ? credentials.email.toLowerCase() : credentials.username + "@uberagora.com"
                    })
                    let entityInventory = new resourceModel({
                        name: credentials.username + "'s Inventory",
                        title: 'Your inventory',
                        names: ['inventory'],
                        owner: entityNew._id
                    })
                    entityNew.inventory = entityInventory._id
                    entityInventory.save((err) => {
                        if (err) {
                            entityInventory.save((err)=>{
                                if(err){
                                    console.log(err)
                                } else {

                                }
                            })
                        } else {
                        }
                    })
                    entityNew.save((err) => {
                        if (err) {
                            if (err.code === 11000) {
                                socket.emit('giveRegister', {
                                    success: false,
                                    reason: 'error',
                                    msg: 'sorry but that user already exists',
                                    err: err
                                })
                            } else {
                                socket.emit('giveRegister', {
                                    success: false,
                                    reason: 'error',
                                    msg: 'an error occured on the server side... sorry for the mistake',
                                    err: err
                                })
                            }
                        } else {
                            delete entityNew.password
                            socket.emit('giveRegister', {
                                success: true
                            })
                            socket.emit('giveAuthenticate', {
                                auth: true,
                                entity: entityNew.toJSON()
                            })
                        }
                    })
                } else if (entity) {
                    let err = "there is already a user with this username or email, please try a different identity"
                    socket.emit('giveRegister', {
                        success: false,
                        reason: 'error',
                        msg: err,
                        err: err
                    })
                } else {
                    let err = "your password was wrong, please try again"
                    socket.emit('giveRegister', {
                        success: false,
                        reason: 'error',
                        msg: err,
                        err: err
                    })
                }
            })
        }
    })
    socket.on('logout', (opts)=>{
        socket.emit('giveAuthenticate', {
            auth: false,
            reason: 'logout',
            msg: 'successfully logged out',
        })
    })

    function saveNewResource(opts, socket){
        // PARSE ALL REALMS TO STRINGS AND ADD HARD CODE REALMS
        opts.resource.realms = opts.resource.realms || []
        opts.resource.realms.forEach((realm, index)=>{
            if(realm && realm.realm){
                opts.resource.realms[index] = realm.realm
            }
        })
        conf.hardRealms.forEach(hardRealm=>{
            if(!opts.resource.realms.includes(hardRealm)){
                opts.resource.realms.push(hardRealm)
            }
        })
        // PARSE ALL RESOURCE NAMES TO STRINGS
        opts.resource.names = opts.resource.names || []
        opts.resource.names.forEach((name,index)=>{
            if(name && name.name){
                opts.resource.names[index] = name.name
            }
        })
        var newResource = new resourceModel(opts.resource)
        newResource.save(err=>{
            if(err){
                console.error('there was an error saving the newResource')
                console.error(opts.resource)
                console.error(err)
                opts.feedback = 'something went wrong saving'
                socket.emit('giveResource', opts)
            } else {
                opts.feedback = 'successfully saved'
                console.log('opts.resource')
                console.log(opts.resource)
                newResource.clientId = opts.resource.clientId
                opts.resource = newResource
                console.log(opts)
                socket.emit('giveResource', opts)
                console.error('successfully saved the newResource')
                console.error(newResource._id)
                opts.resource.parents.forEach(parent=>{
                    resourceModel.findOne({_id: parent})
                        .then((resourceParent)=>{
                            if(resourceParent.resources.indexOf(newResource._id) < 0){
                                resourceParent.resources.push(newResource._id)
                                resourceParent.save(err=>{
                                    if(err){
                                        console.error(err)
                                    } else {
                                        console.error('success')
                                    }
                                })
                            }
                        })
                })
            }
        })
    }
    /// CLOSING BRACKET FOR IO.ON('CONNECTION')
})

// Authentication
/// SET PERSISTENT LOGIN MIDDLEWARE AND FUNCTIONS
// app.use(function(req, res, next) {
//     if (req.session && req.session.user) {
//         User.findOne({ username: req.session.user.username }, function(err, user) {
//             if (user) {
//                 // req.user = user
//                 req.session.user = user
//                 delete req.session.user.password
//                 res.locals.user = req.session.user
//             }
//             next()
//         })
//     } else {
//         next()
//     }
// })

// function reqLog(req, res, next) {
//     if (!req.session.user) {
//         res.redirect('/login')
//     } else {
//         next()
//     }
// }

http.listen(conf.port, () => {
    console.error("%s running on port %s", conf.siteTitle, conf.port)
})

function jsonConcat(o1, o2, sReturn) {
    for (let key in o2) {
        if (o2.hasOwnProperty(key)) {
            o1[key] = {}
            o1[key] = o2[key]
        }
    }
    if (sReturn) {
        return o1
    }
}

