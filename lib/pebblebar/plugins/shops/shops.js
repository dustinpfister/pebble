
var mongoose = require('mongoose')
    , Schema = mongoose.Schema,    
    ShopBase;


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

// find a shop document by the given id
exports.findShopById = function (id, cb) {
    ShopBase.findOne({
        'id': id
    }, '', function (err, shop) {
        if (shop) {
            return cb(null, shop);
        } else {
            return cb(null, null);
        }
    });
};

// start a new shop if the user has enough pebble
exports.startShop = function (users, pebble, username, done) {

    var newShop;

    // find the user
    users.findByUsername(username, function (err, user) {

        if (user) {

            pebble.getAccount(user.primeAccount, function (userAccount) {

                if (userAccount.wallet >= 100) {

                    if (user.shops.length < user.maxShops) {

                        // get the reserve
                        pebble.getReserve(function (reserve) {

                            if (reserve) {

                                pebble.transfer(userAccount, reserve, 100, function () {

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

            });

        } else {


            done({
                mess: 'user not found.'
            });

        }

    });

};

// get a users shops
exports.getUsersShops = function (users, username, done) {

    // get the user
    users.findByUsername(username, function (err, user) {


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

exports.buyShopItems = function (pebble, users, buyer, items, done) {

    // get the buyers UserRec
    users.findByUsername(buyer, function (err, user) {

        // for each item the buyer wants
        items.forEach(function (item) {

            // get the shop
            ShopBase.findOne({
                id: item.shopId
            }, '', function (err, shop) {

                // get the shop owners userRec
                users.findByUsername(shop.shopOwner, function (err, shopUser) {

                    var i = 0
                        , len = shop.forSale.length;

                    users.getUserPrime(shopUser.username, function (shopAccount) {

                        users.getUserPrime(user.username, function (userAccount) {

                            // find the item that the buyer wants
                            while (i < len) {

                                // if it is the item that the buyer wants
                                if (String(shop.forSale[i]._id) === item.itemId) {

                                    // does the buyer have the pebble for the item?
                                    if (userAccount.wallet >= shop.forSale[i].pebbleCost) {

                                        // debit the buyer, and credit the owner
                                        pebble.transfer(userAccount, shopAccount, shop.forSale[i].pebbleCost, function () {

                                            // the buyer gets the item, and the owner looses it from inventory
                                            user.storage.push(shop.forSale.splice(i, 1)[0]);

                                            // save records
                                            user.save();
                                            shopUser.save();
                                            shop.save();

                                        });

                                    }

                                    break;

                                }

                                i++;

                            }

                        });
                        
                    });

                });

            });

        });

    });

    done();

};

// update shops
exports.updateShops = function (done) {

    ShopBase.find(function (err, shops) {


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


    });

    done();

};


// what should be done on plugin setup?
exports.setup = function(db){
    
    console.log('do we have db?');
    console.log(db);
    
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
    
};