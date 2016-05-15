var scope = require('./scope.js')
    , fs = require('fs'),


    checkPluginConf = function (pluginName) {

        console.log(pluginName);
        
        var conf;

        fs.readFile('./lib/pebblebar/plugins/' + pluginName + '/conf.json', 'utf8', function (err, data) {

            if (err) {

                console.log('no conf.json loaded for core : ' + pluginName);

            }

            if (data) {

                console.log('conf.json for core ' + pluginName + ' found.');

                conf = JSON.parse(data);

                console.log(conf.coreFiles);

            }

        });

    };


exports.setup = function (app, db, clientSystem, users, pebble) {

    var mainConf, conf;

    // add the path
    require('./plugins/shops/setup.js').setup(app, db, clientSystem);

    // make the scope?
    scope.createScope(users, pebble);

    scope.addToScope('shops', require('./plugins/shops/shops.js'));

    // read main conf.json
    fs.readFile('./lib/pebblebar/conf.json', 'utf8', function (err, data) {

        // if we have data...
        console.log('********* ********* ********* ');
        if (data) {

            mainConf = JSON.parse(data);

            for (var core in mainConf.active) {

                // core conf file
                checkPluginConf(core);

                mainConf.active[core].forEach(function (app) {

                    var appName = core + '_' + app;

                    // app conf file
                    checkPluginConf(appName);

                });

            }

        }

        console.log('********* ********* ********* ');

    });

};