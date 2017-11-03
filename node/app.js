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
  origins: 'uberagora.dev:*'
})
// io.origins(['*:*'])
let session = require('express-session')
bcrypt = require('bcryptjs')
moment = require('moment')
RedisStore = require('connect-redis')(session)
conf = require('./conf/conf.js')
secretConf = require('secrets')
smartOpts = require('smartOpts')
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
// let dbNode = mongoose.createConnection("mongodb://localhost:27017/node214")
////////// LOAD MODELS
// let postModel = require('./models/nodes/post.js')
realmModel = require('./models/nodes/realm.js')
thingModel = require('./models/nodes/thing.js')
navModel = require('./models/nodes/nav.js')
entityModel = require('./models/nodes/entity.js')

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
  socket.on('getRealms', (opts)=>{
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
    opts = normaliseSortOpts(opts)
    realmModel.find(opts.find).limit(opts.count).sort({
      realm: opts.sortDirectionNormal
    }).then(function (realms) {
      let ret = {
        id: opts.id,
        realms: realms
      }
      socket.emit('giveRealms', ret)
    })
  })
  socket.on('getThing', (opts)=>{
    /**
     * @param opts.thing is the wanted thing, can either be string or object
     * @param opts.populations is a list of wanted population functions
     */
    /** define default opts
     */
      if (!opts) {
        let opts = {}
      }
      var defaultOpts = {
        populations: []
      }
    /** generate opts object
     */
      opts = jsonConcat(defaultOpts, opts, true)
    
    /** checks if we have a valid id to find with
     */
      if (opts.thing && (typeof opts.thing === 'string' || opts.thing._id)) {
        let query = thingModel.findOne({
            _id: opts.thing._id || opts.thing
          })
        if(opts.populations.length > 0){
          query = addPopulationsToQuery(opts.populations, query)
        }
        query.then(thing=>{
            if (thing) {
              let ret = {
                id: opts.id,
                thing,
                parentId: opts.parentId
              }
              socket.emit('giveThing', ret)
            }
          })
      }
  })
  socket.on('getThings', (opts)=>{
    /** function parametres
     * @param count is the number of posts you want
     * @param object @type {object/thing} is the object you want the posts from
     * @param things @type {list of things} is a list of things you want the posts from
     * @param sort is the value by which you want to sort
     * @param sortDirection is the direction/pattern you want to sort in (if undefined it will always be descending)
     * @param includeComments is a boolean which defines whether you want to include comment data with the posts
     * @param commentSort is the value by which you want to sort Comments
     * @param commentSortDirection is the direction/pattern you want to sort comments in (if undefined it will always be descending)
     */
    /** define default opts
     */
      if (!opts) {
        let opts = {}
      }
      var defaultOpts = {
        count: 25,
        sort: undefined,
        sortDirection: 'ascending',
        find: {
          realms: {
            $all: ["posts"]
          }
        },
        checkEdges: false,
        stream: true
      }
    /** generate opts object
      */
      opts = jsonConcat(defaultOpts, opts, true)
      opts = normaliseSortOpts(opts)
    
    /** check if we want only specifically titled inventories populated
     */
      if (opts.checkEdges) {
        var inventoryMatch = []
        for (let source of conf.sources) {
          for (let edge of source.edges) {
            inventoryMatch.push(source.source + ' ' + edge)
          }
        }
      } else {
        var inventoryMatch = []
      }
    /** build our query
     */
      opts.find = compileRegExps(opts.find)
      let query = thingModel.find(opts.find)
      /** check if we want to limit the returned documents
       */
        if (opts.count !== Infinity) {
          query.limit(opts.count)
        }
      /** check if we want to sort the results
       */
        query.sort({
          sortString: opts.sortDirectionNormal
        })
      /** if the stream option is selected and if so we stream the data to the client 
        */
        if (opts.stream) {
          var streamIndex = 0
    
          query.cursor()
            .on('data', function (thing) {
              let ret = {
                parentId: opts.parentId,
                thing,
                index: streamIndex++
              }
              socket.emit('giveThing', ret)
            })
            .on('error', function (err) {
              console.error("there was an error in the stream")
              console.error(err)
            })
            .on('close', function () {
              socket.emit('giveThings', {
                parentId: opts.parentId,
                things: []
              })
            })
      /** otherwise we send all the results back in a single return
       */
        } else {
          query.exec()
            .then(function (things) {
              let ret = {
                parentId: opts.parentId,
                things: things
              }
              socket.emit('giveThings', ret)
            })
        }
  })
  socket.on('saveThing', (opts)=>{
    saveThing(opts, socket)
  })
  socket.on('deleteThing', (opts) => {
    if (opts.thing && opts.thing._id && opts.thing.owners.includes(opts.entity._id)) {
      thingModel.findOne({
          _id: opts.thing._id
        })
        .then((thing, err) => {
          if (!err && thing) {
            entityModel.findOne({
                username: 'agora'
              })
              .then((agora, err) => {
                if (!err && agora) {
                  thing.owners = [agora._id]
                  thing.parents = []
                  thing.stateType = 'deleted'
                  thing.save(err => {
                    if (err) {
                      console.error(err)
                    } else {
                      opts.parentId = undefined
                      opts.thing = thing
                      socket.emit('giveThing', opts)
                      thingModel.find({
                          things: {
                            $in: [thing._id]
                          }
                        })
                        .then((things, err) => {
                          if (!err && things) {
                            things.forEach((inv, index) => {
                              if (inv.things.indexOf(thing._id) >= 0) {
                                inv.things.splice(inv.things.indexOf(thing._id), 1)
                              }
                              inv.save(err => {
                                if (err) {
                                  console.error(err)
                                } else {
                                  opts.parentId = inv._id
                                  socket.emit('confirmThingDeletion', opts)
                                }
                              })
                            })
                          } else {
                            console.error(err)
                          }
                        })
                        .catch(err => {
                          console.error(err)
                        })
                    }
                  })
                } else {
                  console.error('something went wrong')
                  console.error(err)
                }
              })
              .catch(err => {
                console.error(err)
              })
          } else {
            console.error('something went wrong')
            console.error(err)
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  })
  socket.on('populateThings', (opts)=>{
    /** parametres
     *  @param opts.things is a list of id's to populate
     *  @param opts.parentId is the parentId of the thing requesting the population
     *  @param opts.returnPath is the property path of the returning list
     *  @param opts.sort is a string identifying the type of sort you want to perform on the population candidates
     *  @param opts.sortDirection is the direction you want the sorted things to come in, a-z, 0-9, ascending, z-a, 9-0, descending
     *  @param opts.rules is an object of population rules to follow for the list
     *  @param opts.limit is the limit of documents to populate, thus return
     *  @param opts.funCounter is the function identifier number for the client side awaiting function
     */
    /** define default opts
     */
      if (!opts) {
        let opts = {}
      }
      var defaultOpts = {
        limit: 5,
        sort: undefined,
        parentId: undefined,
        sort: undefined,
        sortDirection: 'ascending',
        rules: {},
        returnPath: 'things',
        funCounter: undefined,
        things: []        
      }
      /** generate opts object and find
       */
      opts = jsonConcat(defaultOpts, opts, true)
      console.log(opts.things)
      let thingIds = opts.things.filter(thing=>{
        if(typeof thing === 'string'){
          return thing
        } else if (typeof thing === 'object' && thing._id){
          return thing._id
        }
      })
      let find = {_id: {$in: thingIds}}
      console.log(find)
      find = jsonConcat(find, opts.rules, true)
      console.log(find)
      find = compileRegExps(find)
      console.log(find)
    /** create query
     */
      let query = thingModel.find(find)

    /** apply sorting
     */
      if(opts.sort){
        let sort = {}
        sort[opts.sort] = opts.sortDirection
        query.sort(sort)
      }
    /** apply limiting 
     */
      if(opts.limit){
        query.limit(opts.limit)
      }
    /**
     */
      query.exec()
        .then(things=>{
          let ret = opts
          ret.oldThings = ret.things
          ret.things = things
          socket.emit('giveThings', ret)
        })
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
        if (nav) {
          let ret = {
            id: opts.id,
            nav: nav
          }
          socket.emit('giveNav', ret)
        } else {
          socket.emit('giveNav', {
            id: opts.id,
            err: 'there was no nav found'
          })
        }
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
          console.log('entity')
          console.log(entity)
          thingModel.populate(entity, {
              path: 'inventory'
            })
            .then(entityPopped => {
              console.log('entityPopped')
              console.log(entityPopped)
              socket.emit('giveAuthenticate', {
                auth: true,
                entity: entityPopped.toJSON()
              })
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
          let entityInventory = new thingModel({
            name: credentials.username + "'s Inventory",
            title: 'Your inventory',
            description: 'This is your own inventory, it\'s empty at the moment, add items to it to begin',
            names: ['inventory'],
            owners: [entityNew._id]
          })
          entityNew.inventory = entityInventory._id
          entityInventory.save((err) => {
            if (err) {
              entityInventory.save((err) => {
                if (err) {
                  console.error(err)
                } else {

                }
              })
            } else {}
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
  socket.on('logout', (opts) => {
    console.log('huh?')
    socket.emit('giveAuthenticate', {
      auth: false,
      reason: 'logout',
      msg: 'successfully logged out',
    })
  })

  // functions for api
  function normaliseSortOpts(opts){
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
    return opts
  }
  function addPopulationsToQuery(populations, query){
    for(population of populations){
      query.populate(population)
    }
    return query
  }
  function saveThing(opts, socket) {
    /** opts params
     *  @param opts.thing is the thing we want to save
     *  @param opts.clientId is the id of the client code that sent the thing to be saved
     */
    /** Parse realms into strings
       */
      opts.thing.realms = opts.thing.realms || []
      opts.thing.realms.forEach((realm, index) => {
        if (realm && realm.realm) {
          opts.thing.realms[index] = realm.realm
        }
      })
      conf.hardRealms.forEach(hardRealm => {
        if (!opts.thing.names.includes(hardRealm)) {
          opts.thing.realms.push(hardRealm)
        }
      })
    /** Parse names to to strings
       *  IN THE FUTURE WE NEED TO SAVE ALL UNSAVED NAMES AS RESOURCE
       *  DOCUMENTS, AND THEN STORE THEM AS ID'S AND NOT STRINGS
     */
      opts.thing.names = opts.thing.names || []
      opts.thing.names.forEach((name, index) => {
        if (name && name.name) {
          opts.thing.names[index] = name.name
        }
      })
    /** run thing checks
     *  @func checkParents
     *  @func checkProperties
     *  @func checkThings
     */
      checks(opts.thing)
        .then(ok=>{
          if(ok){
            if (opts.thing._id) {
              thingModel.findOne({
                  _id: opts.thing._id
                })
                .then((thing, err) => {
                  if (!err) {
                    if (thing) {
                      jsonConcat(thing, opts.thing)
                      thing.save((err) => {
                        if (err) {
                          console.error('there was an error saving the new thing')
                          console.error(opts.thing)
                          console.error(err)
                          opts.feedback = 'something went wrong saving'
                          socket.emit('giveThing', opts)
                        } else {
                          opts.feedback = 'successfully saved'
                          opts.thing = thing
                          socket.emit('giveThing', opts)
                          console.error('successfully saved the thing')
                          console.error(opts.thing._id)
                          console.error('this one')
                          opts.thing.parents.forEach(parent => {
                            let id = typeof parent === 'string' ? parent : typeof parent._id === 'string' ? parent._id : undefined
                            if(id){
                              thingModel.findOne({
                                  _id: id
                                })
                                .then((thingParent, err) => {
                                  if (!err) {
                                    if (thingParent.things.indexOf(opts.thing._id) < 0) {
                                      thingParent.things.push(opts.thing._id)
                                      thingParent.save(err => {
                                        if (err) {
                                          console.error(err)
                                        } else {
                                          console.error('success')
                                        }
                                      })
                                    }
                                  } else if (!thingParent) {
                                    saveNewThing()
                                  } else if(err){
                                    console.error(err)
                                  }
                                })
                            } else if (typeof parent === 'object' && !parent._id){
    
                            }
                          })
                        }
                      })
                    } else {
                      saveNewThing(opts, socket)
                    }
    
                  } else {
                    console.error(err)
                  }
                })
    
            } else if (!opts.thing._id) {
              saveNewThing(opts, socket)
            }
          }
        })
  }
  function saveNewThing(opts, socket) {
    /** opts params
     *  @param opts.thing is the thing we want to save
     *  @param opts.clientId is the id of the client code that sent the thing to be saved
     */
    /** create and save new thing and return promise to say saved
     */
      return new Promise((resolve, reject)=>{
        
        var newThing = new thingModel(opts.thing)
        newThing.save(err => {
          if (err) {
            console.error('there was an error saving the newThing')
            console.error(opts.thing)
            console.error(err)
            opts.feedback = 'something went wrong saving'
            socket.emit('giveThing', opts)
            reject()
          } else {
            console.error('successfully saved the newThing')
            console.error(newThing._id)
            opts.feedback = 'successfully saved'
            newThing.clientId = opts.thing.clientId
            opts.thing = newThing
            socket.emit('giveThing', opts)
            opts.thing.parents.forEach(parent => {
              thingModel.findOne({
                  _id: parent
                })
                .then((thingParent) => {
                  if (thingParent.things.indexOf(newThing._id) < 0) {
                    thingParent.things.push(newThing._id)
                    thingParent.save(err => {
                      if (err) {
                        console.error(err)
                      } else {
                        console.error('success')
                      }
                    })
                  }
                })
            })
            resolve()
          }
        })
      })
  }
  function checks(thing){
    /** in this function we perform the checks necessary to validate a potential thing
     * @func checkParents
     * @func checkProperties
     * @func checkThings
     */
    // return await Promise.all([checkParents(thing), checkProperties(thing), checkThings(thing)].map())
  }
  function checkParents(thing){
    // await new Promise((resolve, reject)=>{
    //   if(thing.parents && thing.parents.length > 0){
    //     let checkedThings = []
    //     for(var i = 0; i < thing.parents.length; i++){
    //       if(!thing.parents[i]._id || typeof thing.parents[i] !== 'string'){
    //         checkedThings.push(saveThing(thing.parents[i]))
    //       } else if(typeof thing.parents[i] === 'string' || typeof thing.parents[i]._id === 'string') {
    //         checkedThings.push(thingExists(thing.parents[i]))
    //       }
    //     }
    //     await Promise.all(checkedThings).map(resolve())
    //   } else {
    //     resolve()
    //   }
    // })
  }
  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }
  function compileRegExps(find){
    Object.keys(find).forEach(key=>{
      if(find[key].regex){
        find[key].value = escapeRegExp(find[key].value)
        find[key] = new RegExp(find[key].value, find[key].options)
      }
    })
    return find
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