/*    shops_buyweight responder.js
 *
 *    
 */

var shops = require('./shops.js');

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, users, pebble, done) {

    // buying weight for a shop?
    if (req.body.clientData.buyWeight.pebble) {

        users.getUserPrime(req.user.username, function (userAccount) {

            if (userAccount.wallet >= req.body.clientData.buyWeight.pebble) {

                shops.findShopById(req.body.clientData.buyWeight.id, function (err, shop) {

                    // if we get the shop
                    if (shop) {

                        // make the transfer
                        pebble.transfer({
                                getBy: 'username'
                                , username: req.user.username
                            }, {
                                getBy: 'reserve'
                            }
                            , req.body.clientData.buyWeight.pebble
                            , function (toWallet) {

                                shop.weight += req.body.clientData.buyWeight.pebble;
                                shop.save(function () {

                                    done({

                                        responderPlugin: 'shops_buyweight'
                                        , status: 'weight baught'

                                    });

                                });

                            }
                        );

                    }

                });

            // no new weight becuase the player does not have the pebble
            } else {

                done({

                    responderPlugin: 'shops_buyweight'
                    , status: 'no pebble'

                });

            }

        });

    // no new weight
    } else {

        done({

            responderPlugin: 'shops_buyweight'
            , status: 'no weight'

        });
    }

};