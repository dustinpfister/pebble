var scope = require('./scope.js').getScope();

// process a response for a clientData array
processResponse = function (plug, responseArray, req, res, scope, done) {

    if (req.body.clientData.length > 0) {

        if (plug < req.body.clientData.length) {

            require('./plugins/' + req.body.clientData[plug].plugin + '/responder.js').createAppResponse(
                req.body.clientData[plug]
                , req
                , res
                , scope.users
                , scope.pebble
                , function (response) {

                    plug += 1;

                    responseArray.push(response)

                    processResponse(plug, responseArray, req, res, scope, done);

                }

            );

        } else {

            done({

                mess: 'okay here is your response object'
                , response: responseArray

            });

        }

    } else {

        done({

            mess: 'this is processResponse, but looks like we have an empty app array'

        });

    }

};

exports.post = function (req, res, users, pebble, notPebblebar) {

    // we should have and action.
    if (req.body.action) {

        // is the action a pebblebar post?
        if (req.body.action === 'pebblebar') {

            // do we have client data?
            if (req.body.clientData) {

                // is client data an object?
                if (typeof req.body.clientData === 'object') {

                    // is the constructor of clientData array?
                    if (req.body.clientData.constructor.name === 'Array') {

                        processResponse(0, [], req, res, scope, function (response) {

                            users.getUserSafe(req.user.username, function (user) {

                                response.userData = user;

                                res.send(response);

                            });

                        });

                    // okay so we have an object
                    } else {

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

                } else {

                    console.log('pebblebar: clientData is not an object');

                    //users.getUserSafe(req.user.username, function (user) {
                    scope.users.getUserSafe(req.user.username, function (user) {

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

                scope.users.getUserSafe(req.user.username, function (user) {

                    // just send standard response
                    res.send(JSON.stringify({

                        userData: user

                    }));

                });

            }

        // if not pebblebar
        } else {

            console.log('pebblebar: not a pebblebar action.');

            // no nothing
            notPebblebar();

        }

    } else {

        console.log('pebblebar: no action property found!');

        // do nothing
        notPebblebar();
    }

};