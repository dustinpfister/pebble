/*
 *    fulfille.js at pebblebar root dir for Pebble (https://github.com/dustinpfister/pebble)
 *    copyright 2016 by Dustin Pfister GPL v3
 *
 *    This is called first by pebble.fulfillNext when fulfilling pebble transfers that have been processed.
 *
 */

var scope = require('./scope.js').getScope();

exports.fulfill = function (processed, done, fail) {

    if(done === undefined){ done = function(){}; }
    if(fail === undefined){ fail = function(){}; }

    // ALERT! this is a simple fix for now until we update our setup.js to work 
    // as it should when it comes to calling it's done callback.
    if (scope.users) {

        if (processed.fulfillerPlugin !== 'none') {

            require('./plugins/' + processed.fulfillerPlugin + '/fulfiller.js').fulfill(scope, processed, function () {

                done(processed);

            })

            // no plug-in script
        } else {

            done(processed);

        }

    // if we do not have scope.users keep getting scope until we do
    } else {

        scope = require('./scope.js').getScope();
        
        fail();

    }

};