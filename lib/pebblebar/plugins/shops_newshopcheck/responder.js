/*    shops_newshopcheck responder.js
 *
 *    
 */

var shops = require('./shops.js');

// create a response for the given clientData object
exports.createAppResponse = function(clientData,req,res, users, pebble, done){
    
    // if new shop requested
        if (req.body.clientData.newShop) {

            shops.startShop(users, pebble, req.user.username, function (shopObj) {

                done({
                   
                    responderPlugin : 'shops_newshopcheck',
                    status: 'shop requested',
                    newShop : shopObj
                    
                });



            });


            // no new shop
        } else {

            done({
                
                responderPlugin : 'shops_newshopcheck',
                status : 'no new shop'
                
            });

        }
        
};