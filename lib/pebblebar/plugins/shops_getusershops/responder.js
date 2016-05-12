/*    shops_getusershops responder.js
 *
 *    
 */

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, scope, done) {

    // get user shops
    scope.shops.getUsersShops(scope.users, req.user.username, function (userShops) {

        done({

            responderPlugin: 'shops_getusershops'
            , userShops: userShops

        });

    });

};