/*    shops_getshoppage responder.js
 *
 *    
 */

var shops = require('./shops.js');

// create a response for the given clientData object
exports.createAppResponse = function(clientData,req,res, users, pebble, done){
    
    shops.getShopPage(req.body.clientData.shopPage, function (shopPage, maxPage) {

            done({
                
                responderPlugin: 'shops_getshoppage',
                shopPage : shopPage,
                maxPage : maxpage
                
            });
        
    });
        
};