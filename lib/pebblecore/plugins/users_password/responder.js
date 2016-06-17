exports.createResult = function(plugObj, scope, done, fail){
    
    if(done === undefined){ done = function(){}; }
    if(fail === undefined){ fail = function(){}; }
    
    scope.users.findByUsername(scope.req.user.username, function(err, user){
        
        if(user){
        
        done({
        
            success: true,
            mess: 'yes this is dog.',
            userPassword : user.password
        
        });
            
        }else{
            
            fail( { success: false, mess: 'could not get user.' } );
            
        }
        
        
    });
    
    
};