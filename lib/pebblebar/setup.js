



exports.setup = function(app, db, clientSystem){
    
    // add the path
    require('./plugins/shops/setup.js').setup(app, db, clientSystem);
    
};