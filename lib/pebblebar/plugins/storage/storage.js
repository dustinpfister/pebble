// storage.js

// get a users storage, or make it if it is not there
exports.getUserStorage = function(username, scope, done){
    
    var self = this;
    
    scope.users.getPlugData(username, 'storage', function(storage){
        
        if(storage.sucess){
            
            done({
               
                mess: 'user storage found',
                storage: storage
                
            });
            
        }else{
            
            self.makeUserStorage(username, scope, function(storage){
                
                done({
                   
                    mess: 'user did not have storage, so it was created',
                    storage : storage
                    
                });
                
            });
            
        }
        
    });
    
};

// make a storage object in the given usernames pluginData
exports.makeUserStorage = function(username, scope, done){
    
    scope.users.createPlugData(username, 'storage', function(){
    
        done();
    
    });
    
};

exports.setup = function(db){
    
    console.log('storage.js setup called!');
    
};