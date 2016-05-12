/*    scope.js
 *
 *    create and get the scope object that is used by plugins
 */

var scope = {};


// called to create the scope object
exports.createScope = function(users, pebble, done){
    
    // empty function if a done callback is not given
    if(done === undefined){ done = function(){}; }
    
    // start ( or start over ) with an empty object
    scope = {};
    
    // we will always want the built in users, and pebble files
    scope.users = users;
    scope.pebble = pebble;
    
    console.log('IT MIGHT HAVE WORKED');
    
    // call done
    done();
    
};

// get the current scope
exports.getScope = function(){
    
    return scope;
    
};