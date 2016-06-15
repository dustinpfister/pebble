
var plugins = ['users_password'];

exports.post = function(req, res, done, fail){
    
    
    if(req.body.clientData){
    
        done();
        
    }else{
        
        fail({mess: 'no clientData was given.'});
        
    }
      
};