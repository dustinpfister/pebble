var scope = require('./scope.js')
    , fs = require('fs'),


    checkPluginConf = function (pluginName, app, db, clientSystem) {

        //console.log(pluginName);
        
        var conf;

        fs.readFile('./lib/pebblebar/plugins/' + pluginName + '/conf.json', 'utf8', function (err, data) {

            if (err) {

                console.log('no conf.json loaded for core : ' + pluginName);

            }

            if (data) {

                //console.log('conf.json for core ' + pluginName + ' found.');

                conf = JSON.parse(data);

                //console.log(conf.coreFiles);
                
                // loop threw fore files
                
                
                
                conf.coreFiles.forEach(function(coreFile){
                   
                    
                    var filePath = './plugins/' + pluginName + '/' + coreFile + '.js';
                    
                    switch(coreFile){
                    
                        case 'setup':
                            
                           // require(filePath).setup(app, db, clientSystem);
                            
                            console.log('setup');
                            console.log(filePath);
                            //require(filePath).setup(app, db, clientSystem, scope);
                            
                            
                            
                        break;
                            
                    }
                    
                    //console.log(filePath);
                    
                });

            }

        });

    };


exports.setup = function (app, db, clientSystem, users, pebble) {

    var mainConf, conf;

    // add the path
    require('./plugins/shops/setup.js').setup(app, db, clientSystem);

    // make the scope?
    scope.createScope(users, pebble);

    //scope.addToScope('shops', require('./plugins/shops/shops.js'));

    // read main conf.json
    fs.readFile('./lib/pebblebar/conf.json', 'utf8', function (err, data) {

        // if we have data...
        //console.log('********* ********* ********* ');
        if (data) {

            mainConf = JSON.parse(data);

            for (var core in mainConf.active) {

                // core conf file
                checkPluginConf(core, app, db, clientSystem);
                
                
                if(core === 'shops'){
                    
                    scope.addToScope('shops', require('./plugins/shops/shops.js'));
                    
                }
                
                mainConf.active[core].forEach(function (app) {

                    var appName = core + '_' + app;

                    // app conf file
                    checkPluginConf(appName, app, db, clientSystem);

                });

            }

        }

        //console.log('********* ********* ********* ');

    });

};