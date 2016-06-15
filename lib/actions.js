
var users = require('./users.js');
exports.checkForAction = function (req, res, done, fail) {

    // is there an action?
    if (req.body.action) {

        // if the user is not logged in
        if (!req.user) {

            //done({mess:'user is not logged in'});

            switch (req.body.action) {

            case 'logout':

                fail({
                    mess: 'you are not logged in.'
                    , success: false
                });

                break;

                // login action
            case 'login':

                passport.authenticate('local', function (err, user, info) {

                    if (err) {

                        return fail({
                            mess: 'login fail.'
                            , success: false
                        });

                    }

                    if (!user) {

                        return fail({
                            mess: 'login fail.'
                            , success: false
                        });

                    }

                    req.logIn(user, function (err) {

                        if (err) {

                            return fail({
                                mess: 'login fail.'
                                , success: false
                            });

                        }

                        return done({
                            mess: 'login good.'
                            , success: true
                        });

                    });

                })(req, res, next);

                break;


            default:

                fail({
                    mess: 'unkown action'
                    , success: false
                });

                break;

            }

            // else if the user is logged in   
        } else {

            // check in on each action
            users.checkIn(req.user.username, function () {});

                switch (req.body.action) {
      
                    case 'pebblebar':
                        
                        require('./pebblebar/responder.js').post(req, res, function () {
                        
                            done({mess:'something went wrong with pebblebar.'})
                            
                            
                        });
                            
                        break;

                    default: done({

                        mess: 'unkown action'

                    });

                    break;

                }

            

        }

        // no action in req.body
    } else {

        fail({
            mess: 'no action found in request.'
        });

    }

};

/*
    if (!req.user) {

        // some other action?
        if (req.body.action) {

            switch (req.body.action) {

            case 'logout':

                res.send(JSON.stringify({
                    mess: 'you are not logged in.'
                    , success: false
                }));

                break;

                // login action
            case 'login':

                passport.authenticate('local', function (err, user, info) {

                    if (err) {

                        return res.send(JSON.stringify({
                            mess: 'login fail.'
                            , success: false
                        }));

                    }
                    if (!user) {

                        return res.send(JSON.stringify({
                            mess: 'login fail.'
                            , success: false
                        }));

                    }

                    req.logIn(user, function (err) {

                        if (err) {

                            return res.send(JSON.stringify({
                                mess: 'login fail.'
                                , success: false
                            }));

                        }

                        return res.send(JSON.stringify({
                            mess: 'login good.'
                            , success: true
                        }));
                    });
                })(req, res, next);

                break;


            default:

                res.send({
                    mess: 'unkown action'
                });

                break;

            }

            // if no action just say they are not logged in.
        } else {

            res.send({
                mess: 'you are not logged in.'
                , success: false
            });

        }

        // else if the user is logged in
    } else {

        users.checkIn(req.user.username, function () {

            //console.log(req.user.username + ' has checked in.');

        });

        //require('./lib/pebblebar/responder.js').post(req,res,users,pebble,function(){
        require('./lib/pebblebar/responder.js').post(req, res, function () {

            // not a pebblebar post?

            // some other action?
            if (req.body.action) {

                switch (req.body.action) {

                    // if foo return bar
                case 'foo':

                    res.send(JSON.stringify({
                        mess: 'bar!'
                    }));

                    break;

                case 'login':

                    res.send(JSON.stringify({
                        mess: 'you are all ready loged in as ' + req.user.username
                        , success: false
                    }));


                    break;

                    // logout action
                case 'logout':

                    req.logout();
                    res.send(JSON.stringify({
                        mess: 'logout'
                        , success: true
                    }));

                    break;

                    // grant pebble
                case 'grant':

                    pebble.grant(req, function (response) {

                        response.mess = 'grant response.';
                        res.send(JSON.stringify(response));

                    });

                    break;

                    // the user wants to give pebble away somewhere, how nice.
                case 'give':

                    pebble.give(
                        req,

                        // done
                        function (response) {

                            response.mess = 'thank you.';
                            res.send(JSON.stringify(response));

                        },

                        // fail
                        function (mess) {

                            res.send(JSON.stringify(mess));


                        }

                    );

                    break;

                    // send unkown action response by default
                default:

                    res.send(JSON.stringify({
                        mess: 'unkown action.'
                    }));

                    break;

                }

                // no action? send "hey stop that!"
            } else {

                res.send(JSON.stringify({
                    mess: 'hey stop that!'
                }));

            }
        });

    }

    */