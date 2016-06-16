
var plugins = ['users_password'];

exports.post = function(req, res, done, fail){
    
    var i, len;
    
    if(req.body.clientData){
    
        if(typeof req.body.clientData === 'object'){
        
        
            done({mess:'we are looking good.'});
            
        }else{
            
            fail({mess: 'clientData given is not an object.'});
            
        }
        
    }else{
        
        fail({mess: 'no clientData was given.'});
        
    }
      
};