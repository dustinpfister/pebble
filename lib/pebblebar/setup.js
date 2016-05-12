

var scope = require('./scope.js');

exports.setup = function(app, db, clientSystem, users, pebble){
    
    // add the path
    require('./plugins/shops/setup.js').setup(app, db, clientSystem);
    
    // make the scope?
    
    scope.createScope(users, pebble);
    
    scope.addToScope('shops', require('./plugins/shops/shops.js'));
    
};