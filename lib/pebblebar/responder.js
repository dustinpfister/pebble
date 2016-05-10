// process a response for a clientData array
var processResponse = function () {


};


exports.post = function (req, res, users, pebble, notPebblebar) {

    // we should have and action.
    if (req.body.action) {

        // is the action a pebblebar post?
        if (req.body.action === 'pebblebar') {

            // always get usersafe object that is part of the standard response
            //users.getUserSafe(req.user.username, function (user) {

            //console.log('pebblebar : looks like we have an app.');

            // do we have client data?
            if (req.body.clientData) {

                // is client data an object?
                if (typeof req.body.clientData === 'object') {

                    console.log('constructor: ' + req.body.clientData.constructor.name)

                    // is the constructor of clientData array?
                    if (req.body.clientData.constructor.name === 'Array') {

                        users.getUserSafe(req.user.username, function (user) {

                            // append the updated standard response to response object.
                            // response.userData = user;

                            // send the response object.
                            res.send({

                                mess: 'looks like we might have valid client data...'
                                , userData: user

                            });

                        });


                        // okay so we have an object
                    } else {


                        /*
                        users.getUserSafe(req.user.username, function (user) {

                            // append the updated standard response to response object.
                            // response.userData = user;

                            // send the response object.
                            res.send({

                                mess: 'clientData should be an Array.'
                                , userData: user

                            });

                        });
                        */




                        require('./plugins/' + req.body.clientData.plugin + '/responder.js').responder(
                            req
                            , res
                            , users
                            , pebble
                            , function (response) {

                                users.getUserSafe(req.user.username, function (user) {

                                    // append the updated standard response to response object.
                                    response.userData = user;

                                    // send the response object.
                                    res.send(response);

                                });


                            }
                        );



                    }

                    // call the create response method of the current apps backend
                    /*
                    require('./plugins/'+req.body.clientData.plugin+'/responder.js').responder(
                        req, 
                        res, 
                        users, 
                        pebble, 
                        function(response){
                
                                users.getUserSafe(req.user.username, function(user){
                                
                                    // append the updated standard response to response object.
                                    response.userData = user;
                                    
                                    // send the response object.
                                    res.send(response);
                                    
                                });
                                
                
                        }
                    );
                    
                    */

                } else {


                    console.log('pebblebar: clientData is not an object');

                    users.getUserSafe(req.user.username, function (user) {

                        // just send standard response
                        res.send(JSON.stringify({

                            mess: 'why is client data not an object?'
                            , userData: user

                        }));

                    });

                }

                // if no clientData
            } else {

                console.log('pebblebar: just sending standared response');

                users.getUserSafe(req.user.username, function (user) {

                    // just send standard response
                    res.send(JSON.stringify({

                        userData: user

                    }));

                });

            }

            //});

            // if not pebblebar
        } else {

            console.log('pebblebar: not a pebblebar action.');

            // no nothing
            //res.send(null);
            notPebblebar();

        }

    } else {

        console.log('pebblebar: no action property found!');

        // do nothing
        //res.send(null);
        notPebblebar();
    }

};