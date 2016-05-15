var scope = require('./scope.js')
    , fs = require('fs');


exports.setup = function (app, db, clientSystem, users, pebble) {

    var conf;

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

            conf = JSON.parse(data);

            for (var core in conf.active) {

                console.log(core);

                // core conf file?
                fs.readFile('./lib/pebblebar/plugins/' + core + '/conf.json', 'utf8', function (err, data) {

                    if (err) {

                        console.log('no conf.json loaded for core : ' + core);

                    }

                    if (data) {

                        console.log('conf.json for core ' + core + ' found.');

                    }

                });

                conf.active[core].forEach(function (app) {

                    var appName = core + '_' + app;

                    console.log(appName);

                    // conf file?
                    fs.readFile('./lib/pebblebar/plugins/' + appName + '/conf.json', 'utf8', function (err, data) {

                        if (err) {

                            console.log('no conf.json loaded for app : ' + appName);

                        }

                        if (data) {

                            console.log('conf.json for app ' + appName + ' found.');

                        }

                    });

                });

            }

        }

        console.log('********* ********* ********* ');

    });

};