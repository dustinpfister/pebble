/*    shops_getshoppage responder.js
 *
 *    
 */

//var shops = require('./shops.js');

// create a response for the given clientData object
exports.createAppResponse = function(clientData,req,res, scope, done){
    
    scope.shops.getShopPage(clientData.pageNumber, function (page, maxPage) {
        
            done({
                
                plugin: 'shops_getshoppage',
                page : page,
                maxPage : maxPage
                
            });
        
    });
        
};