exports.checkForAction = function(req, done, fail){
    
    if(!req.body.action){
        
        fail();
        
    }else{
        
        done({mess:'looks good.'});
    }
    
};