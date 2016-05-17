/*    user_checkin plugin 
 *
 */

// create a response for the given clientData object
exports.createAppResponse = function (clientData, req, res, scope, done) {

    // call done callback with response object
    done({

        responderPlugin: 'user_checkin'

    });


};