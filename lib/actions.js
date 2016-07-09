 /*
 *    actions.js for Pebble (https://github.com/dustinpfister/pebble)
 *    Copyright 2016 by Dustin Pfister (GPL v3)
 *
 *    this file is responsible for finding if a given post request contains an known 'action',
 *    if so that action is executed.
 *
 */
 
var users = require('./users.js')
    
, passport = require('passport')
, Strategy = require('passport-local').Strategy;


exports.checkForAction = function (req, res, next, done, fail) {

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
                        
                    case 'pebblecore':
                        
                        require('./pebblecore/responder.js').post(req,res, 
                          
                            // done
                            function(response){
                            
                                done(response)
                            
                            },
                             
                            // fail
                            function(status){
                            
                                fail(status)
                            
                            }
                        
                        );
                        
                        break;
                        
                    case 'login':

                        done({
                            mess: 'you are all ready loged in as ' + req.user.username
                            , success: false
                        });

                    break;
                        
                        // logout action
                    case 'logout':

                        req.logout();
                        done({
                            mess: 'logout'
                            , success: true
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
