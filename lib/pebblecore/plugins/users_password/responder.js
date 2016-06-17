exports.createResult = function(plugObj, scope, done, fail){
    
    if(done === undefined){ done = function(){}; }
    if(fail === undefined){ fail = function(){}; }
    
    console.log('this is dog, woof!');
    console.log(scope.req.user.username);
    
    
    
    scope.users.findByUsername(scope.req.user.username, function(err, user){
    
        console.log('are you fucking me?');
        
        done({
        
            success: true,
            mess: 'yes this is dog.'
        
        });
        
        /*
        if(user){
        
        done({
        
            success: true,
            mess: 'yes this is dog.',
            //userPassword : user.password
        
        });
            
        }else{
            
            fail( { success: false, mess: 'could not get user.' } );
            
        }
        */
        
    });
    
    
};