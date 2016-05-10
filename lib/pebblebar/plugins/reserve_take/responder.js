
// create a response for the given clientData object
exports.createAppResponse = function(clientData,req,res, users, pebble, done){
    
    console.log('okay we are getting here at least');
    
    // call done callback with response object
    done({
        
        responderPlugin: 'reserve_take'
        
    });
    
};
