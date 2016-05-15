

var scope = require('./scope.js'),
    fs = require('fs');
    

exports.setup = function(app, db, clientSystem, users, pebble){
    
    var conf;
    
    // add the path
    require('./plugins/shops/setup.js').setup(app, db, clientSystem);
    
    // make the scope?
    scope.createScope(users, pebble);
    
    scope.addToScope('shops', require('./plugins/shops/shops.js'));
    
    // read main conf.json
    fs.readFile('./lib/pebblebar/conf.json', 'utf8', function(err, data){
        
        // if we have data...
        console.log('********* ********* ********* ');
        if(data){
            
            conf = JSON.parse(data);
            
            for(var core in conf.active){
             
                console.log(core);
                conf.active[core].forEach(function(app){
                    
                    console.log(core + '_' + app);
                    
                });
                
            }
            
        }
        
        console.log('********* ********* ********* ');
        
    });
    
};