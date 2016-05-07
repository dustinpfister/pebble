// update plugins


exports.update = function(){
    
    require('./plugins/shops/shops.js').updateShops(function(){
        
        console.log('shops updated');
        
    });
    
};