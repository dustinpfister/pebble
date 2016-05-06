exports.setup = function(app, db,clientSystem){
    
    require('./path.js').pluginPath(app, clientSystem);
    
    // call setup for shops.js
    require('./shops.js').setup(db);
    
};