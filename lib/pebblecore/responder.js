
// the plugins
var plugins = ['users_password'],
  
// get users, and pebble.js
users = require('../users.js'),
pebble = require('../pebble.js'),
    
// process a response for a given clientData array.
processResponse = (function(){
    
    // index and response arrays in the closure.
    var i = 0, response = [];
        
    // the api that is returned
    api = {
        
        // reset the index pointer, and the response array
        reset : function(){
            
            i = 0;
            response = [];
            
            console.log('reset');
            
        },
        
        // process the next object in the cleintData array.
        processNext: function(clientData, done){
            
            console.log(i)
            
            // if i is less then the clientData array, process the next object
            if(i < clientData.length){
                
                response.push({mess : 'foo'})
                
                i += 1;
                
                this.processNext(clientData, done);
            
            // else we are done
            }else{
            
                done(response);
                
            }
            
        }
        
    }
    
    return api; 
    
}());

exports.post = function(req, res, done, fail){
    
    var i, len, response;
    
    if(req.body.clientData){
    
        if(typeof req.body.clientData === 'object'){
        
            if(req.body.clientData.constructor.name === 'Array'){
            
                processResponse.reset();
                processResponse.processNext(req.body.clientData, function(response){
                    
                    done({
                    
                        mess:'response from pebblecore.',
                        response: response
                        
                    });
                     
                });
                
                //response = [];
                
                //i=0, len = req.body.clientData.length;
                
                // BOOKMARK! we just need to do what we did for pebblebar.
                
                //done({
                    
                //    mess:'response from pebblecore.',
                //    response: response
                //});
                
            }else{
                
                fail({mess: 'constructor function of the object that was given for clientData is not an array'});
                
            }
            
        }else{
            
            fail({mess: 'clientData given is not an object.'});
            
        }
        
    }else{
        
        fail({mess: 'no clientData was given.'});
        
    }
      
};