/*
 *    reserve_take responder.js
 *
 *    respond to a take request from the client
 */

// the default object this is stored in the userRecs pluginData property.
var pluginDefault = require('./pluginDefault.js').default;

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, scope, done) {

    if (clientData.amount === undefined) {

        done({

            plugin: 'reserve_take'
            , sucess: false
            , mess: ' no amount property given'

        });

    } else {

        if (typeof clientData.amount === 'number') {

            // take may be requested if amount is greater then 0, and less than 100
            if (clientData.amount > 0 && clientData.amount <= 100) {

                scope.users.pluginData(
                    req.user.username
                    , pluginDefault,

                    // done getting the users pluginData
                    function (pluginData) {

                        var time = new Date() - new Date(pluginData.lastTake);

                        if (time >= 60000) {

                            scope.pebble.transferRequest({

                                from: {
                                    getBy: 'reserve'
                                }
                                , to: {
                                    getBy: 'username'
                                    , username: req.user.username
                                }
                                , amount: clientData.amount
                                , fulfillerPlugin: 'reserve_take'
                                , fulfillerData: {
                                    takeuser: req.user.username
                                },

                                done: function () {

                                    done({

                                        plugin: 'reserve_take'
                                        , sucess: true
                                        , mess: 'the transaction request was made.'

                                    });

                                },

                                fail: function () {

                                    done({

                                        plugin: 'reserve_take'
                                        , sucess: false
                                        , mess: 'an error happend while requesting the transfer.'

                                    });

                                }

                            });

                        } else {

                            done({

                                plugin: 'reserve_take'
                                , sucess: false
                                , mess: 'to soon wait a while.'

                            });

                        }

                    },

                    // fail
                    function () {

                        done({

                            plugin: 'reserve_take'
                            , sucess: false
                            , mess: 'something went wrong getting the pluginData'

                        });

                    }

                );

            } else {

                done({

                    plugin: 'reserve_take'
                    , sucess: false
                    , mess: 'the number given is zero or lower, above 100, or NaN'

                });

            }

        } else {

            done({

                plugin: 'reserve_take'
                , sucess: false
                , mess: 'amount propert given is not a number'

            });

        }

    }

};