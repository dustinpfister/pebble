/*    storage_getstorage responder.js
 *
 *    
 */

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, scope, done) {

    
    console.log('storage_getstorage: creating app response...');
    
    done({

        responderPlugin: 'storage_getstorage'
        , mess: 'not doing anything for now, sorry'

    });

};