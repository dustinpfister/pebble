exports.post = function(req, res, users, pebble){
    
    // we should have and action.
    if(req.body.action){
        
        // is the action a pebblebar post?
        if (req.body.action === 'pebblebar') {
    
            // always get usersafe object that is part of the standard response
            //users.getUserSafe(req.user.username, function (user) {

                console.log('pebblebar : looks like we have an app.');
                
                // if clientData
                if(req.body.clientData){
                
                    // call the create response method of the current apps backend
                    require('./backends/' + req.body.clientData.pebbleAppName + '.js').createResponse(
                        req, 
                        res, 
                        users, 
                        pebble, 
                        function(response){
                
                                users.getUserSafe(req.user.username, function(user){
                                
                                    // append the updated standard response to response object.
                                    response.userData = user;
                                    
                                    // send the response object.
                                    res.send(response);
                                    
                                });
                                
                
                        }
                    );
                    
                // if no clientData
                }else{
                    
                    console.log('pebblebar: just sending standared response');
                
                    users.getUserSafe(req.user.username, function(user){
                            
                        // just send standard response
                        res.send(JSON.stringify({

                            userData: user

                        }));
                        
                    });
                    
                }

            //});
        
        // if not pebblebar
        }else{
        
            console.log('pebblebar: not a pebblebar action.');
            
            // no nothing
            res.send(null);
            
        }
        
    }else{
    
        console.log('pebblebar: no action property found!');
        
        // do nothing
        res.send(null);
        
    }
    
};