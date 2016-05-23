/*    shops_buyweight responder.js
 *
 *    
 */

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, scope, done) {

    // buying weight for a shop?
    if (clientData.buyWeight.pebble) {

        scope.users.getUserPrime(req.user.username, function (userAccount) {

            if (userAccount.wallet >= clientData.buyWeight.pebble) {

                scope.shops.findShopById(clientData.buyWeight.id, function (err, shop) {

                    // if we get the shop
                    if (shop) {

                        // make the transfer
                        pebble.transfer({
                                getBy: 'username'
                                , username: req.user.username
                            }, {
                                getBy: 'reserve'
                            }
                            , clientData.buyWeight.pebble
                            , function (toWallet) {

                                shop.weight += clientData.buyWeight.pebble;
                                shop.save(function () {

                                    done({

                                        plugin: 'shops_buyweight'
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

                    plugin: 'shops_buyweight'
                    , status: 'no pebble'

                });

            }

        });

    // no new weight
    } else {

        done({

            plugin: 'shops_buyweight'
            , status: 'no weight'

        });
        
    }

};