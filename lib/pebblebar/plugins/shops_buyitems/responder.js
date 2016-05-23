/*    shops_buyitems responder.js
 *
 *    
 */

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, scope, done) {

    if (!clientData.buyItems) {

        done({

            plugin: 'shops_buyitems'
            , status: 'must give a buyItems array'

        });

    } else {

        if (clientData.buyItems.length > 0) {

            scope.shops.buyShopItems(scope, req.user.username, req.body.clientData.buyItems, function () {

                done({

                    plugin: 'shops_buyitems'
                    , status: 'buying items'

                });

            });

            // no items requested
        } else {

            done({

                plugin: 'shops_buyitems'
                , status: 'no items baught'

            });

        }

    }

};