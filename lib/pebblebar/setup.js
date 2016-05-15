

var scope = require('./scope.js'),
    fs = require('fs');
    

exports.setup = function(app, db, clientSystem, users, pebble){
    
    // add the path
    require('./plugins/shops/setup.js').setup(app, db, clientSystem);
    
    // make the scope?
    
    scope.createScope(users, pebble);
    
    scope.addToScope('shops', require('./plugins/shops/shops.js'));
    
    
    
    fs.readFile('./lib/pebblebar/conf.json', 'utf8', function(err, data){
        
        console.log('*********');
        if(data){
            
            console.log(JSON.parse(data));
            
        }
        console.log('*********');
        
    });
    
};