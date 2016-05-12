/*    shops_buyitemscheck responder.js
 *
 *    
 */

var shops = require('./shops.js');

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, users, pebble, done) {

    if (req.body.clientData.buyItems.length > 0) {

        shops.buyShopItems(pebble, users, req.user.username, req.body.clientData.buyItems, function () {

            done({

                responderPlugin: 'shops_buyitemscheck'
                , status: 'buying items'

            });

        });

    // no items requested
    } else {

        done({

            responderPlugin: 'shops_buyitemscheck'
            , status: 'no items baught'
        });
    }

};