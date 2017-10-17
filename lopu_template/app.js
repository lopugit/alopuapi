var express = require('express')
var session = require('express-session')
    // router = express.Router()
cookieParser = require('cookie-parser')
bcrypt = require('bcryptjs')
csrf = require('csurf')
fs = require('fs')
path = require('path')
bodyParser = require('body-parser')
url = require('url')
shopify = require('shopify-buy')
nodemailer = require('nodemailer')
forms = require('mongoose-forms')
moment = require('moment')
var Form = forms.Form,
    Bridge = forms.Bridge,
    RedisStore = require('connect-redis')(session)
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

/// If using node mailer
// var emailConf = require('./conf/email')
/// IF USING SESSIONS
// var sessConf = require('./conf/session')
/// SET SESSION CONFIG
// Session
app.use(
    session({
        name: "lopu.sid",
        secret: "78t2b7tcrtc2839yt982892746bc923659g82635dj289hertaetp230965vwb89ryat83946btwe8yf",
        resave: false,
        saveUninitialized: false,
        store: new RedisStore({
            host: 'localhost',
            port: 6379,
            ttl: 260
        })
    })
)

/// Routing
// var routes = require('./routes/public')
// app.use(router)
// app.use('/', routes)

//// CSRF THINGS
// app.use(csrf())
// app.use(function(req, res, next) {
//
// 	var token = req.csrfToken()
// 	// es.cookie('XSFR-TOKEN', token)
// 	res.locals.csrfToken = token
// 	next()
//
// })

/// SET SITE WIDE VARIABLES
app.locals.site = "Philoverse"
app.locals.siteurl = "/"
app.locals.title = "Our Frequency"
app.locals.deploy = "local"
app.locals.page = {
        mode: "lopu"
    }
    ////// SET PROJECT PUBLIC FOLDERS
app.use(express.static('client'))
app.use('/styles', express.static(__dirname + '/styles'))
app.use('/js', express.static(__dirname + '/js'))
app.use('/img', express.static(__dirname + '/public/img'))

///// SET BODY PARSER CONFIG
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//// SET VIEW ENGINE PUG/JADE
app.set('view engine', 'pug')
app.locals.basedir = path.join(__dirname, '/views')

/////// MONGODB AND MONGOOSE THINGS
var MongoClient = require('mongodb')
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
var db = mongoose.createConnection("mongodb://localhost:27017/siteDb")
var nodes = mongoose.createConnection("mongodb://localhost:27017/nodes")
    // /////// LOAD ALL MODELS
var socialModels = require('./models/social')
var adminModels = require('./models/admin')
    /// SAVE MODELS TO VARS
var post = socialModels.post
var User = adminModels.user
    /// SET PERSISTENT LOGIN MIDDLEWARE AND LOGIN VERIFICATION FUNCTIONS
app.use(function(req, res, next) {
    if (req.session && req.session.user) {
        User.findOne({ username: req.session.user.username }, function(err, user) {
            if (user) {
                // req.user = user
                req.session.user = user
                delete req.session.user.password
                res.locals.user = req.session.user
            }
            next()
        })
    } else {
        next()
    }
})

function reqLog(req, res, next) {
    if (!req.session.user) {
        console.log(req.originalUrl)
        req.session.prevPage = req.originalUrl
        res.redirect("/manifest")
    } else {
        next()
    }
}

function renderLatest20(req, res) {
    post.find({}).sort([
        ['fbData.updated_time', 'descending']
    ]).limit(20).exec().then(function(posts) {
        res.locals.posts = posts
        res.render('pages/home')
    })
}

var connections = []
io.on('connection', function(socket) {
    connections.push(socket);
    console.log("new connection, connections: " + connections.length);
    socket.on('disconnect', function(data) {
        connections.splice(connections.indexOf(socket), 1)
        console.log("lost connection, connections: " + connections.length);
    })

    /// SOCKET EVENT HANDLERS
    socket.on('something', function(data) {
        console.log("does something")
    })
})

//// ROUTING ////
app.get('/(|modes.:mode|modes)', function(req, res) {
    req.session.prevPage = req.originalUrl
    if (!req.params.mode) {
        var page = app.locals.page
        res.locals.page = page
        console.log("this is the if")
        console.log(app.locals.page)
        renderLatest20(req, res)
    } else {
        var page = app.locals.page
        res.locals.page = page
        res.locals.page.mode = req.params.mode
        console.log("this is the else")
        console.log(app.locals.page)
        renderLatest20(req, res)
    }
})

app.get('/my.self', reqLog, function(req, res) {
    res.render('pages/self/mySelf')
})

app.get('/(|manifest|login)', function(req, res) {
    if (req.session && req.session.user) {
        User.findOne({ username: req.session.user.username }, function(err, user) {
            if (!user) {
                req.session.destroy()
                res.render('pages/admin/manifest')
            } else {
                res.locals.user = req.session.user
                console.log(req.session.prevPage)
                if (!req.session.prevPage) {
                    res.redirect('/my.self')
                } else {
                    res.redirect(req.session.prevPage)
                }
            }
        })
    } else {
        res.render('pages/admin/manifest')
    }
})

app.post('/(|manifest|login)', function(req, res) {
    User.findOne({
        $or: [
            { username: req.body.username },
            { email: req.body.username }
        ]
    }, function(err, user) {
        if (err) {
            res.send(err)
        } else if (!user) {
            res.locals.error = "You have not yet incarnated. please <a href='/incarnate'>incarnate</a>"
            res.render('pages/admin/manifest')
        } else if (bcrypt.compareSync(req.body.password, user.password)) {
            req.session.user = user
            delete req.session.user.password
            res.redirect(req.session.prevPage)
        }
    })
})

app.get('/incarnate', function(req, res) {
    if (req.session && req.session.user) {
        User.findOne({ username: req.session.username }, function(err, user) {
            if (err) {
                req.session.destroy()
                res.locals.error = err
                res.render('pages/admin/incarnate')
            } else if (!user) {
                req.session.destroy()
                res.render('pages/admin/incarnate')
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.render('pages/admin/incarnate')
    }
})

app.post('/incarnate', function(req, res) {
    if (req.body.password === req.body.confirmPassword) {
        var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(12))
        var newUser = new user({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            alias: req.body.alias,
            luckyNumber: req.body.luck
        })
        newUser.save(function(err) {
            if (err) {
                console.log(err)
                res.locals.error = "Damn, something went wrong and we're not sure what it was, but it occured while trying to incarnate you, a glitch in the matrix it seems"
                if (err.code === 11000) {
                    res.locals.error = "It seems you already exist, please <a href='/manifest'>manifest</a>"
                }
                res.render('pages/admin/incarnate')
            } else {
                req.session.user = newUser
                delete req.session.user.password
                res.redirect('/')
            }
        })

    }
})

app.get('/(|disappear|dissolve|logout|leave)', function(req, res) {
    req.session.destroy()
    res.redirect('/')
})

app.get('/(|thoughts|thoughts.:thoughtId)', function(req, res) {

    if (req.params.thoughtId) {
        post.findById(req.params.thoughtId, function(err, thought) {
            if (thought !== null) {
                res.locals.thought = thought
            } else {
                res.locals.error = "This thought doesn't seem to exist"
            }
            res.render('pages/self/thought')

        })
    }

})

// AGORA routes

app.get('/agora', function(req, res) {
    res.render('pages/home')
})

//// FINAL CONFIG
app.get('/test', function(req, res) {
    res.send("no test set")
})

/// 404 HANDLERS
app.get('*', function(req, res) {
    res.render("pages/404")
})



//// APP LISTENER FOR CLIENTS
var port = 8888
http.listen(port, () => console.log('listening on port %s', port))