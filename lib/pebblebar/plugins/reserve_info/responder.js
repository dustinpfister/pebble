/*    the reserve_info plugin gets current info about the reserve
 *
 */

// create a response for the given clientData object
exports.createAppResponse = function(clientData,req,res, users, pebble, done){
    
    // reserve
    pebble.getReserve(function(reserve){
    
        // call done callback with response object
        done({
        
            responderPlugin: 'reserve_info',
            reserve : reserve
        
        });
        
    });
    
};