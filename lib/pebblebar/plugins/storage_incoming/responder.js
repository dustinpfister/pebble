/*    storage_incoming responder.js
 *
 *    
 */

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, scope, done) {


    done({

        responderPlugin: 'storage_incoming'
        , mess: 'not doing anything for now, sorry'

    });

};