var mongoose = require('mongoose')
    , openShift = require('./openshift.js').openShiftObj
    , Schema = mongoose.Schema,

    // pebble lib
    pebble = require('./pebble.js'),

    db = mongoose.createConnection(openShift.mongo),

    // user record collection
    UserRec = db.model('user_record', new Schema({

        // indenity and loggin 
        id: Number
        , username: String
        , password: String

        // pebble accounts
        , accounts: [] // the accounts array is to replace wallet
        , primeAccount: String // the account number of the users primeAccount

        // user activity
        , lastCheckIn: String
        
        // plugins
        , pluginData: {}
        
        // OLD STUFF THAT WILL BE REMOVED.
        , wallet: Number
        // Shops
        , maxShops: Number
        , shops: Array
        // Storeage ( products that the user has on hand )
        ,storage: [
            {
                productName: String, // the name of the product to produce
                pebbleCost: Number
            }
        ]
        , maxStorage: Number // the max number of products a user can store on hand
        ,landSize: Number // Land


    })),

    // user Info collction
    UserInfo = db.model('user_info', new Schema({

        infoID: String
        , userCount: Number

    }));

// get plugin data for the given username, and plugin name
exports.getPlugData = function(username, plugin, done){
    
    
};

// create plugin data for the given username, and plugin name
exports.createPlugData = function(username, plugin, done){
    
    
};

exports.checkIn = function(username, done){
    
    this.findByUsername(username, function(err, user){
    
        user.lastCheckIn = new Date().toString();
        
        user.save(function(){
        
            done({
        
               mess:'check in compleate for user ' + username,
               lastCheckIn: user.lastCheckIn
            });
            
        });
        
    });
    
    
},
    
// find a user document by the given id
exports.findById = function (id, cb) {
    UserRec.findOne({
        'id': id
    }, '', function (err, user) {
        if (user) {
            return cb(null, user);
        } else {
            return cb(null, null);
        }
    });
};

// find a user document by the given username
exports.findByUsername = function (username, cb) {
    UserRec.findOne({
        'username': username
    }, '', function (err, user) {
        if (user) {
            return cb(null, user);
        } else {
            return cb(null, null);
        }
    });
};

// get a users NON SENSATIVE info that is okay to send out over http (no ssl)
exports.getUserSafe = function (username, done) {

    var self = this;

    UserRec.findOne({
        'username': username
    }, 'maxShops shops accounts', function (err, user) {

        if (user) {

            self.getUserPrime(username, function (account) {

                user.wallet = account.wallet;

                done(user);

            });

        } else {

            done(null);

        }

    });

};

// create a new user info object if you don't find one.
exports.infoCheck = function () {

    // first check for the main user info record

    UserInfo.findOne({
        infoID: 'main'
    }, '', function (err, info) {

        if (!info) {

            info = new UserInfo({
                infoID: 'main'
                , userCount: 0
            });
            info.save(function () {

                console.log('new user info object.');

            })

        } else {

            console.log('user info object found: we have ' + info.userCount + ' users.');

        }

    });

}

// set land based off the given pebble amount
exports.getLand = function (peb, done) {

    var byRandom, byWorld, byEqual, size;

    pebble.getReserve(function (reserve) {

        if (reserve) {
            byRandom = Math.round(Math.random() * 90);
            byWorld = Math.round(Math.pow(600, peb / reserve.worldTotal));
            byEqual = peb > reserve.equalShare ? 300 : peb / reserve.equalShare * 300;
            size = 10 + byRandom + byEqual + byWorld;

            done(size);

        } else {

            done(10);

        }


    });


};

// create a new user with the given post request
exports.newUser = function (req, res) {

    var newUser, self = this;

    // find if the user name is all ready in the database
    this.findByUsername(req.body.username, function (err, user) {

        // if the user is not there it can be created
        if (!user) {

            // get the main user info object
            UserInfo.findOne({
                infoID: 'main'
            }, '', function (err, info) {

                if (info) {

                    pebble.createAccount(req.body.username, function (accountNumber) {

                        newUser = new UserRec({

                            username: req.body.username
                            , password: req.body.password
                            , accounts: [accountNumber]
                            , primeAccount: accountNumber
                            , pluginData: {}
                            , lastCheckIn: new Date().toString()
                            
                            // old stuff
                            , wallet: 0
                            , shops: []
                            , maxShops: 3
                            , storage: []
                            , maxStorage: 10
                            
                            
                        });

                        newUser.id = info.userCount;

                        self.getLand(0, function (size) {

                            newUser.landSize = size;

                            info.userCount += 1;

                            info.save(function () {

                                newUser.save(function () {

                                    pebble.popChange(info.userCount);

                                    console.log('new user!');

                                });

                            });

                        });

                    });

                }

            });

        } else {

            console.log('user name is taken, new user not created.');

        }

    });


    res.redirect('/login');

};

// get the users prime pebble account
exports.getUserPrime = function (username, done, fail) {

    this.findByUsername(username, function (err, user) {

        if (user) {

            pebble.getAccount(user.primeAccount, function (account) {

                done(account);


            });

        }else{
            
            fail({status: 'users.getUserPrime: user not found!'});
            
        }

    });

};

// credit a users prime account from the given account
exports.creditUserPrime = function (fromAccount, username, amount, done) {

    // find the user rec
    this.findByUsername(username, function (err, user) {

        if (user) {

            pebble.getAccount(user.primeAccount, function (account) {

                // make the transfer
                pebble.transfer(fromAccount, account, amount, function (wallet) {

                    done(wallet)

                });

            });

        }

    });


};

// call the given function for all users
exports.forAll = function (forUser) {

    UserRec.find(function (err, users) {

        users.forEach(function (user) {

            forUser(user);

        });

    });
};

// call callback with users
exports.getUsers = function (done) {

    UserRec.find(function (err, users) {

        done(users);

    });

};