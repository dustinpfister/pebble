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

    })),
    

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

    })),

    // SHOP Constructor  
    Shop = function (json) {

        this.shopName = 'buzzed mead\'s.';
        this.products = [

            {
                productName: 'MEAD'
                , price: 10

        }

    ];

    };

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

// find a shop document by the given id
exports.findShopById = function (id, cb) {
    ShopBase.findOne({
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

    UserRec.findOne({
        'username': username
    }, 'wallet maxShops shops', function (err, user) {

        if (user) {

            done(user);

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

                    newUser = new UserRec({

                        username: req.body.username
                        , password: req.body.password
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
                                console.log(newUser);

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

// credit the given username's wallet with the given amount
exports.creditUser = function (username, amount, done) {

    // find if the user name is all ready in the database
    this.findByUsername(username, function (err, user) {

        if (user) {

            user.wallet += amount;

            user.save(function () {

                console.log('credited account ' + username + ' with ' + amount + ' pebbles. ');

                done(user.wallet)

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

// start a new shop if the user has enough pebble
exports.startShop = function (username, done) {

    var newShop;

    // find the user
    this.findByUsername(username, function (err, user) {

        if (user) {

            if (user.wallet >= 100) {

                if (user.shops.length < user.maxShops) {

                    // get the reserve
                    pebble.getReserve(function (reserve) {

                        if (reserve) {

                            // lets make a deal
                            user.wallet -= 100;
                            reserve.wallet += 100;

                            newShop = new ShopBase({

                                id: new Date().getTime()
                                , shopName: 'A Farm'
                                , shopType: 'farm'
                                , weight: 1000
                                , shopOwner: user.username
                                , production: [
                                    {
                                        productName: 'food'
                                        , lastMade: new Date().toString()
                                        , rate: 90000
                                    }
                                ]
                                , forSale: []
                                , forSaleLimit: 5

                            });

                            // push the shop id to the users shop array
                            user.shops.push(newShop.id);

                            // update reserve, user account, and shop base
                            reserve.save(function () {

                                user.save(function () {

                                    newShop.save(function () {

                                        done({

                                            mess: 'looks good lets give you one...'
                                            , theShop: newShop

                                        });

                                    });

                                });

                            });

                        } else {

                            done({
                                mess: 'no reserve!?'
                            });

                        }

                    });



                } else {

                    done({
                        mess: 'to many shops sell one'
                    });

                }

            } else {

                done({
                    mess: 'sorry, you do not have the pebble.'
                })


            }

        } else {


            done({
                mess: 'user not found.'
            });

        }

    });

};

// get the given shop page
exports.getShopPage = function (pageNumber, done) {

    var maxPage = 1;

    // find tottal page count
    // ALERT! This could be stored in some collection that is updated every time a store is made or lost.
    ShopBase.find({}, function (err, shops) {

        maxPage = Math.ceil(shops.length / 3);

    });

    // find current page
    ShopBase.find().sort({
        weight: -1
    }).skip(pageNumber * 3).limit(3).exec(
        function (err, shopPage) {

            done(shopPage, maxPage);

        });

};

// get a users shops
exports.getUsersShops = function (username, done) {

    // get the user
    this.findByUsername(username, function (err, user) {


        var i = 0
            , len = user.shops.length
            , query = [];

        // build the query, using the users shop id's in user.shops
        while (i < len) {

            query.push({
                "id": user.shops[i]
            });

            i++;
        }

        // get the shops
        ShopBase.find({
            "$or": query
        }, function (err, shops) {


            done(shops);

        });


    });

};

// call to buy a shop item
exports.buyShopItems = function (buyer, items, done) {

    var self = this;

    // get the buyers UserRec
    this.findByUsername(buyer, function (err, user) {

        // for each item the buyer wants
        items.forEach(function (item) {

            // get the shop
            ShopBase.findOne({
                id: item.shopId
            }, '', function (err, shop) {

                // get the shop owners userRec
                self.findByUsername(shop.shopOwner, function (err, shopUser) {

                    var i = 0
                        , len = shop.forSale.length;
                    
                    
                    // find the item that the buyer wants
                    while (i < len) {

                        // if it is the item that the buyer wants
                        if (String(shop.forSale[i]._id) === item.itemId) {

                            // does the buyer have the pebble for the item?
                            if (user.wallet >= shop.forSale[i].pebbleCost) {

                                // debit the buyer, and credit the owner
                                user.wallet -= shop.forSale[i].pebbleCost;
                                shopUser.wallet += shop.forSale[i].pebbleCost;
                                
                                // the buyer gets the item, and the owner looses it from inventory
                                //user.storage.push(shop.forSale.splice(i, 1));

                                //console.log('the requested item');
                                user.storage.push(shop.forSale.splice(i, 1)[0]);
                                
                                
                                // save records
                                user.save();
                                shopUser.save();
                                shop.save();

                            }


                            break;

                        }

                        i++;

                    }

                });

            });

        });

    });

    //ShopBase.find({id:})

    done();

};

// update shops
exports.updateShops = function (done) {

    ShopBase.find(function (err, shops) {

        console.log('**********');
        console.log('time to update shops');

        // for each shop
        shops.forEach(function (shop) {

            // for each shop production
            shop.production.forEach(function (production) {

                // the amount of time sense last production
                var time = new Date() - new Date(production.lastMade)
                    , proCount
                    , freeSpace;

                // if time is greater then production rate
                if (time >= production.rate) {

                    // the production count
                    proCount = Math.floor(time / production.rate);
                    //freeSpace = shop.forSaleLimit - shop.forSale.length;
                    //console.log(production.productName);

                    while (proCount > 0) {

                        // break out of limit is reached
                        if (shop.forSale.length >= shop.forSaleLimit) {

                            break;

                        }

                        shop.forSale.push({

                            productName: production.productName
                            , pebbleCost: 10

                        });

                        proCount -= 1;

                    }

                    production.lastMade = new Date().toString();
                }

                // console.log( time > production.rate);
                // console.log();

            });

            shop.save();

        });

        console.log('**********');

    });

    done();

};