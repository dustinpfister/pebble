var mongoose = require('mongoose')
    , openShift = require('./openshift.js').openShiftObj
    , Schema = mongoose.Schema,

    // pebble lib
    pebble = require('./pebble.js'),

    db = mongoose.createConnection(openShift.mongo),

    // user record collection
    UserRec = db.model('user_record', new Schema({

        // Basic 
        id: Number
        , username: String
        , password: String,

        // Pebble
        wallet: Number,

        accounts: [], // the accounts array is to replace wallet
        primeAccount: String, // the account number of the users primeAccount


        // Shops
        maxShops: Number
        , shops: Array,

        // Storeage ( products that the user has on hand )
        storage: [
            {
                productName: String, // the name of the product to produce
                pebbleCost: Number
            }
        ]


        
        , maxStorage: Number, // the max number of products a user can store on hand

        // Land
        landSize: Number


    })),

    // user Info collction
    UserInfo = db.model('user_info', new Schema({

        infoID: String
        , userCount: Number

    }));

    /*
    // Shop collction
    ShopBase = db.model('shop', new Schema({

        // Basic shop info
        id: String, // the id of the stop
        shopName: String, // the name of the shop
        shopOwner: String, // the username of the player that owns the shop.

        // Weight (weight effects the shop rank on the shop list?)
        weight: Number,

        // type
        shopType: String,

        // Production (what products are being produced and the rate at which they are made)
        production: [

            {
                productName: String, // the name of the product to produce
                lastMade: String, // a time stamp that reflects the last time production occured.
                rate: Number // the amount of time that needs to pass until one unit of the procuct is made

        }

    ],

        // For Sale
        forSale: [ // products that are for sale to anyone who wants them.
            {
                productName: String, // the product name (food, oil, water, wood, ect)
                pebbleCost: Number // the amount of pebble needed to buy the product from the shop owner.
        }
    ]
        , forSaleLimit: Number

    }));


    */
    
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


    console.log(pebble);

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
                            , wallet: 0
                            , shops: []
                            , accounts: [accountNumber]
                            , primeAccount: accountNumber
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
                                    console.log(newUser);

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

    console.log(fromAccount);

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