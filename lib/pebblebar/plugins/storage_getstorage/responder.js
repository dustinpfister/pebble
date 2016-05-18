/*    storage_getstorage responder.js
 *
 *    
 */

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, scope, done) {

    
    console.log('storage_getstorage: creating app response...');
    console.log(scope.storage)
    
    scope.storage.getUserStorage(req.user.username, scope, function(res){
        
        done({

            responderPlugin: 'storage_getstorage'
            , mess: 'not doing anything for now, sorry'
            , response: res

        });
        
    });

};