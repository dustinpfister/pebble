/*    shops_buyitemscheck responder.js
 *
 *    
 */

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, scope, done) {

    if (clientData.buyItems.length > 0) {

        scope.shops.buyShopItems(scope, req.user.username, req.body.clientData.buyItems, function () {

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