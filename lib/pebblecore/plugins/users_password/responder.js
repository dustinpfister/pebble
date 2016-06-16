exports.createResult = function(plugObj, scope, done, fail){
    
    if(done === undefined){ done = function(){}; }
    if(fail === undefined){ fail = function(){}; }
    
    console.log('this is dog, woof!');
    console.log(scope.req.user.username)
    
    done({
        
        success: true,
        mess: 'yes this is dog.'
        
    });
    
};