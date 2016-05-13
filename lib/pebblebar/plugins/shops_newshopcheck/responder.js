/*    shops_newshopcheck responder.js
 *
 *    
 */

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, scope, done) {

    // if new shop requested
    if (clientData.newShop) {

        scope.shops.startShop(scope.users, scope.pebble, req.user.username, function (shopObj) {

            done({

                responderPlugin: 'shops_newshopcheck'
                , status: 'shop requested'
                , newShop: shopObj

            });

        });

    // no new shop
    } else {

        done({

            responderPlugin: 'shops_newshopcheck'
            , status: 'no new shop'

        });

    }

};