/*    shops_buyweight responder.js
 *
 *    
 */

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, scope, done) {

    // buying weight for a shop?
    if (req.body.clientData.buyWeight.pebble) {

        scope.users.getUserPrime(req.user.username, function (userAccount) {

            if (userAccount.wallet >= req.body.clientData.buyWeight.pebble) {

                scope.shops.findShopById(req.body.clientData.buyWeight.id, function (err, shop) {

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