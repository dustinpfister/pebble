
// create a response for the given clientData object
exports.createAppResponse = function(clientData,req,res, users, pebble, done){
    
    
    if(clientData.requested){
    
        pebble.takeRequest(req.user.username, clientData.requested, function (wallet) {

        
            done({
                takeWalletAfter: wallet
                , take: 'take complete maybe'
            });

        
        });
        
    }else{
        
        
        done({mess: 'take not compleate, requested pebble not found.'})
        
    }
    
    /*
    console.log('okay we are getting here at least');
    
    // call done callback with response object
    done({
        
        responderPlugin: 'reserve_take'
        
    });
    
    */
    
};
