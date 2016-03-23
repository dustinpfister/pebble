var mongoose = require('mongoose')
    , openShift = require('./openshift.js').openShiftObj
    , Schema = mongoose.Schema,

    // users
    users = require('./users.js'),

    db = mongoose.createConnection(openShift.mongo),

    Reserve = db.model('reserve', {

        id: String, // the id of the reserve record 'main' is what is used in the game.
        worldTotal: Number, // total world pebbles
        wallet: Number, // the number of pebbles in the reserve account
        population: Number, // the current world population ( number of users )
        equalShare: Number // what an equal share of the total world pebbles is.

    });

// check for the reserve account and create it if it is not there
exports.reserveCheck = function () {

    Reserve.findOne({
        id: 'main'
    }, '', function (err, reserve) {

        if (reserve) {

            console.log('reserve account found: ');
            console.log('world total: ' + reserve.worldTotal);
            console.log('reserve wallet: ' + reserve.wallet);
            
            console.log('popuation: ' + reserve.population);
            console.log('equal share: ' + reserve.equalShare);

        } else {

            console.log('reserve account not found!');
            console.log('making new one...');

            reserve = new Reserve({

                id: 'main'
                , worldTotal: 1000
                , equalShare: 1000
                , population: 0
            , });
            reserve.wallet = reserve.worldTotal;
            reserve.save(function () {

                console.log('new reserve saved');

            });


        }

    });

};

// population has changed to the given population
exports.popChange = function (population) {

    Reserve.findOne({
        id: 'main'
    }, '', function (err, reserve) {

        if (reserve) {

            // update population and equal share
            reserve.population = population;
            reserve.equalShare = reserve.worldTotal / reserve.population;
            reserve.save(function(){
               
                console.log('reserve account data updated');
                
            });
            
        }


    });

};


// a take request from the reserve to the given user.
exports.takeRequest = function (username, amount, done) {

    amount = Math.floor(amount);

    Reserve.findOne({
        id: 'main'
    }, '', function (err, reserve) {

        console.log('take request!');

        if (reserve) {

            if (reserve.wallet >= amount) {

                console.log('there are pebbles in the account to give the take.');

                console.log(amount);

                reserve.wallet -= amount;
                reserve.save(function () {

                    users.creditUser(username, amount, function (wallet) {

                        console.log('wallet');
                        console.log(wallet);
                        done(wallet);

                    });

                });


            }

        }


    });

};