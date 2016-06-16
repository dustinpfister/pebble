exports.createResult = function(plugObj, scope, done, fail){
    
    if(done === undefined){ done = function(){}; }
    if(fail === undefined){ fail = function(){}; }
    
    done({
        
        success: true,
        mess: 'yes this is dog.'
        
    });
    
};