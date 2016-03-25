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
        equalShare: Number, // what an equal share of the total world pebbles is.
        brackets: Array, // tax brackets
        lastCollection: Date // the last time taxes where collected

    });


// what should be done and returned for a users check post
exports.check = function(update, done){
    
    Reserve.findOne({id: 'main'}, '', function(err, reserve){
        
        if(reserve){
            
            console.log(update);
            
            users.findByUsername(update.username, function(err, user){
            
                done({ reserve : reserve, userWallet: user.wallet });
                
            });
            
        }
        
    });
    
    
};

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
            console.log('brackets:');
            console.log(reserve.brackets);

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
            reserve.brackets = [];
            reserve.lastCollection = new Date();
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
            reserve.brackets = brackets = [
                {
                    lessThen: reserve.equalShare / 10
                    , rate: 0
                }

                
                , {
                    lessThen: reserve.equalShare / 5
                    , rate: 0.05
                }

                
                , {
                    lessThen: reserve.equalShare / 2
                    , rate: 0.12
                }

                
                , {
                    lessThen: reserve.equalShare
                    , rate: 0.25
                }
            ];





            reserve.save(function () {

                console.log('reserve account data updated');

            });

        }


    });

};

// get the tax rate for the given wallet amount
exports.getTaxRate = function (amount, done) {

    var i, len, rate = 0
        , bracket

    Reserve.findOne({
        id: 'main'
    }, '', function (err, reserve) {


        console.log('getting tax rate for amount: ' + amount);

        // bracket system
        if (amount < reserve.equalShare) {

            i = 0;
            len = reserve.brackets.length;
            rate = 0;

            while (i < len) {

                bracket = reserve.brackets[i];

                if (amount < bracket.lessThen) {

                    rate = bracket.rate;
                    break;

                }

                i++;

            }

            // flat tax
        } else {

            rate = 0.65;

        }

        done(rate, amount);

    });

};

// collect tax for all users
exports.collectTax = function () {

    var time, self=this, tax=0;

    // get the reserve
    Reserve.findOne({
        id: 'main'
    }, '', function (err, reserve) {

        time = new Date() - reserve.lastCollection;

        console.log('time from last tax: ' + time);

        // tax every minute?
        if (time >= 60000) {

            reserve.lastCollection = new Date();

            reserve.save(function () {

                console.log('time to tax');

                // tax all users
                users.forAll(function (user) {

                    //reserve.wallet += user.wallet;
                    //user.wallet -= user.wallet;

                    self.getTaxRate(user.wallet, function(rate, amount){
                    
                        tax = 0;
                        
                        // if tax rate is greater than 0 tax em
                        if(rate > 0){
                            
                            tax = Math.floor(user.wallet * rate);
                            reserve.wallet += tax;
                            user.wallet -= tax;
                            
                        }
                        
                        
                        reserve.save(function () {

                            user.save(function () {

                                //console.log(user.username + 'tax rate: ' + rate);
                                console.log('tax amount of collected for : ' + user.username);

                            });

                        });
                        
                    });


                });

            });

        } else {

            console.log('no taxing yet...');

        }

        /*
        // for all users collect tax
        users.forAll(function(user){
        
            reserve.wallet += user.wallet;
            user.wallet -= user.wallet;
            
            console.log(user.username + ' : ' +user.wallet);
            
            reserve.save(function(){
                
                user.save(function(){
                    
                    console.log('tax collected for : ' + user.username);
                    
                })
                
            });
            
        
        });
        
        */


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