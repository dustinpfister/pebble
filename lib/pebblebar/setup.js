



exports.setup = function(app, clientSystem){
    
    // add the path
    require('./plugins/shops/setup.js').setup(app, clientSystem)
    
};