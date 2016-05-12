/*    shops_getusershops responder.js
 *
 *    
 */

var shops = require('./shops.js');

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, users, pebble, done) {

    // get user shops
    shops.getUsersShops(users, req.user.username, function (userShops) {

        done({

            responderPlugin: 'shops_getusershops'
            , userShops: userShops

        });

    });

};