// #!/bin/env node
 /*
 *    server.js for Pebble (https://github.com/dustinpfister/pebble)
 *    Copyright 2016 by Dustin Pfister (GPL v3)
 *
 *    This is the main "server.js" this is to be called by node ( $ node server.js) to start pebble
 *
 */

var express = require('express'), session = require('express-session'), MongoStore = require('connect-mongo/es5')(session), openShift = require('./lib/openshift.js').openShiftObj, mongoose = require('mongoose'), db = mongoose.createConnection(openShift.mongo)

    // passport
, passport = require('passport'), Strategy = require('passport-local').Strategy

    // express app
, app = express()

    // client system in use:
, clientSystem = 'command_only'

    // users
, users = require('./lib/users.js')

    // pebble lib
    pebble = require('./lib/pebble.js');

// use passport local strategy
// following example at : https://github.com/passport/express-4.x-local-example/blob/master/server.js
passport.use(new Strategy(

        function (username, password, cb) {

        users.findByUsername(username, function (err, user) {

            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            if (user.password != password) {
                return cb(null, false);
            }
            return cb(null, user);
        });

    }));

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {

    users.findById(id, function (err, user) {

        if (err) {
            return cb(err);
        }

        cb(null, user);
    });

});

// Use application-level middleware for common functionality, including logging, parsing, and session handling.
app.use(require('cookie-parser')());
app.use(require('body-parser').json({
        limit : '5mb'
    }));
app.use(require('body-parser').urlencoded({
        extended : true,
        limit : '5mb'
    }));
app.use(session({
        secret : 'keyboard cat', // ALERT! look into express-session and why the secret is important
        resave : false,
        store : new MongoStore({
            url : openShift.mongo
        }),
        saveUninitialized : false,
        limit : '5mb'
    }));
app.use(passport.initialize()); // Initialize Passport and restore authentication state, if any, from the session
app.use(passport.session());

// use EJS for rendering
app.set('view engine', 'ejs');
app.use(express.static('views')); // must do this to get external files

// wild get request handler
app.get('*', function (req, res, next) {

    var visitPaths = ['/login', '/signup'], // paths that are okay to visit without being logged in
    i = 0,
    len = visitPaths.length,
    okay;

    // check if logged in
    if (req.user) {

        next();

        // redirect to login page
    } else {

        i = 0;
        okay = false;
        while (i < len) {

            if (req.path === visitPaths[i]) {

                okay = true;

                break;

            }

            i++;

        }

        // if not okay redirect
        if (!okay) {

            res.redirect('/login');

        } else {

            next();

        }

    }

});

// root get requests
app.get('/', function (req, res, next) {

    pebble.getReserve(function (reserve) {

        res.render('systems/' + clientSystem + '/main', {

            req : req,
            reserve : reserve,
            user : req.user

        });

    });

});

// all posts are sent to root (except for the login, and sign up paths)
app.post('/', function (req, res, next) {

    // actions.js checks all incoming post request for known 'actions'
    require('./lib/actions.js').checkForAction(req, res, next,

        // action found in request
        function (response) {

        res.send(response);

    },

        // fail
        function (response) {

        res.send(response);

    });

});

// login path
app.get('/login', function (req, res, next) {

    res.render('systems/' + clientSystem + '/login', {});

});

// login
app.post('/login',

    // authenticate
    passport.authenticate('local', {
        failureRedirect : '/login'
    }),

    // success
    function (req, res) {

    res.redirect('/');

});

// logout path
app.get('/logout', function (req, res) {

    req.logout();
    res.redirect('/login');

});

// the sign up path
app.get('/signup', function (req, res, next) {

    res.render('systems/' + clientSystem + '/signup', {});

});

// posts to sign up path
app.post('/signup', function (req, res, next) {

    users.newUser(req,

        function () {

        res.redirect('/login');

    },

        function (status) {

        //res.redirect('/signup')

        res.render('systems/' + clientSystem + '/signupfail', {
            status : status
        });

    });

});

// start the server
app.listen(openShift.port, openShift.ipaddress, function () {

    var taxloop,
    pebbleProcess;

    console.log('server.js: pebble lives');

    users.infoCheck(function () {

        pebble.reserveCheck(function () {

            require('./lib/pebblebar/setup.js').setup(app, db, clientSystem, users, pebble, function () {

                // the tax loop
                taxLoop = function () {

                    var t = setTimeout(taxLoop, 10000);

                    // run pebblebars updater
                    require('./lib/pebblebar/updater.js').update();

                },

                pebbleProcess = (function () {

                    var lastCheck = new Date(0),

                    // check the reserve obect for the time of the last check
                    checkReserve = function (done) {

                        pebble.getReserve(function (reserve) {

                            console.log('server.js : pebble process reserve check... ');
                            //console.log(reserve.sanity.lastCheck);

                            lastCheck = new Date(reserve.sanity.lastCheck);

                            done();

                        });

                    },

                    sanityCheck = function () {

                        pebble.sanityCheck(function (report) {

                            console.log('sanity check compleate:');
                            console.log(report);

                            // this should  work for now, but should not be set this way
                            lastCheck = new Date(report.checkDone);

                            loop();

                        });

                    },

                    loop = function () {

                        var t = setTimeout(loop, 3000),

                        time = new Date() - lastCheck;

                        console.log('server.js : time sence last sanity check: ' + time);

                        if (time < 10000) {

                            pebble.processNext();
                            pebble.fulfillNext();

                        } else {

                            clearTimeout(t);
                            console.log('time for a sanity check');

                            sanityCheck();

                        }

                    };

                    checkReserve(function () {

                        console.log('server.js: okay reserve check went well. starting the pebbleProcess loop...');

                        loop();

                    });

                }
                    ());

                // start tax loop, and pebble process.
                taxLoop();
                //pebbleProcess();

            });

        });

    });

});
