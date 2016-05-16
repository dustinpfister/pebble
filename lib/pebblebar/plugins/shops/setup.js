exports.setup = function(app, db,clientSystem, scope){
    
    require('./path.js').pluginPath(app, clientSystem);
    
    // call setup for shops.js
    require('./shops.js').setup(db);
    
    //scope.addToScope('shops', require('./plugins/shops/shops.js'));
    //scope.addToScope('shops', require('./shops.js'));
    
    
};

exports.test = function(){
    
    console.log('okay so thats not the problem');
    
}