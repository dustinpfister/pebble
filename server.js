// #!/bin/env node

/*    Pebble
 *    Copyright 2016 by Dustin Pfister (GPL-3.0)
 *    dustin.pfister@gamil.com
 *    
 *    https://github.com/dustinpfister/pebble
 *
 *    try to get them all!
 */

var express = require('express')
    , session = require('express-session')
    , MongoStore = require('connect-mongo/es5')(session)
openShift = require('./lib/openshift.js').openShiftObj,

    // passport
    passport = require('passport')
    , Strategy = require('passport-local').Strategy,

    // express app
    app = express(),


    // users
    users = require('./lib/users.js'),

    // pebble lib
    pebble = require('./lib/pebble.js'),

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

        }


    ));

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
    limit: '5mb'
}));
app.use(require('body-parser').urlencoded({
    extended: true
    , limit: '5mb'
}));
app.use(session({
    secret: 'keyboard cat', // ALERT! look into express-session and why the secret is important
    resave: false
    , store: new MongoStore({
        url: openShift.mongo
    })
    , saveUninitialized: false
    , limit: '5mb'
}));
app.use(passport.initialize()); // Initialize Passport and restore authentication state, if any, from the session
app.use(passport.session());

// use EJS for rendering
app.set('view engine', 'ejs');
app.use(express.static('views')); // must do this to get external files


app.get('*', function (req, res, next) {

    var visitPaths = ['/login', '/signup'], // paths that are okay to visit without being logged in
        i = 0
        , len = visitPaths.length
        , okay;

    // check if logged in
    if (req.user) {

        next();

        // redirrect to login page
    } else {

        console.log(req.path);

        i = 0;
        okay = false;
        while (i < len) {
            if (req.path === visitPaths[i]) {
                okay = true;
                break;
            }
            i++;
        }

        // if not okay redirrect
        if (!okay) {
            res.redirect('/login')
        } else {
            next();
        }

    }

});

app.get('/', function (req, res, next) {

    pebble.getReserve(function (reserve) {

        res.render('main', {

            req: req
            ,reserve: reserve
            , user: req.user

        });

    });

});
app.post('/', function (req, res) {

    // ALERT ! do we really need to do this for every post to / ?
    users.getUserSafe(req.user.username, function (user) {

        // pebblebar backend
        if (req.body.action === 'pebblebar') {

            console.log('pebblebar!');
            console.log(req.body);

            // if we have pebbleAppName do what needs to be done for the app
            if (req.body.clientData.pebbleAppName) {

                switch (req.body.clientData.pebbleAppName) {

                    // the reserve client at the /reserve path
                case 'reserve_client':

                    console.log('reserve client!');

                    // get the reserve object
                    pebble.getReserve(function (reserve) {

                        if (req.body.clientData.requested > 0) {

                            pebble.takeRequest(req.user.username, req.body.clientData.requested, function (wallet) {

                                // update user wallet with current amount
                                user.wallet = wallet;

                                // send results of the take
                                res.send(JSON.stringify({
                                    userData: user
                                    , reserve: reserve
                                    , takeWalletAfter: wallet
                                    , take: 'take complete'
                                }));

                            });

                        } else {

                            // send no take response
                            res.send(JSON.stringify({
                                userData: user
                                , reserve: reserve
                                , take: 'no take'
                            }));

                        }

                    });

                    break;

                default:

                    // send just the user data for pebblebar itself
                    res.send(JSON.stringify({
                        userData: user
                    }));


                    break;

                }


            } else {

                // send just the user data for pebblebar itself
                res.send(JSON.stringify({
                    userData: user
                }));

            }

        } else {

            // we have nothing to send
            res.send(null);

        }


    });

    
    
   

});


app.get('/reserve', function (req, res) {

    res.render('reserve', {

        req: req,
        user: req.user

    });
    

});


app.get('/login', function (req, res, next) {

    res.render('login', {});

});
app.post('/login',

    // authenticate
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),

    // success
    function (req, res) {

        console.log(req.user.name + ' loggin!');

        res.redirect('/');
    }

);




app.get('/logout', function (req, res) {

    req.logout();
    res.redirect('/login');

});

app.get('/signup', function (req, res, next) {

    res.render('signup', {});

});
app.post('/signup', function (req, res, next) {

    users.newUser(req, res);

});

// start the server
app.listen(openShift.port, openShift.ipaddress, function () {

    console.log('pebble lives');

    users.infoCheck();
    pebble.reserveCheck();

    // the tax loop
    var taxLoop = function () {

        var t = setTimeout(taxLoop, 65000);
        pebble.collectTax();

    };
    taxLoop();


});