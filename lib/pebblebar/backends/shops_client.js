/*    shops client pebblebar backend
 *
 */


// createResponse methods creates a response object that is returned via a callback
exports.createResponse = function(req, res, users, pebble, done){
    
    console.log('shops client request!');

        // get the shops page
        users.getShopPage(req.body.clientData.shopPage, function (shopPage, maxPage) {

            // get user shops
            users.getUsersShops(req.user.username, function (userShops) {

                // if new shop requested
                if (req.body.clientData.newShop) {

                    console.log('new shop request');

                    users.startShop(req.user.username, function (shopObj) {

                        done({

                            // userData: user
                            shopPage: shopPage
                            , maxPage: maxPage
                            , newShop: shopObj
                            , userShops: userShops

                        });


                    });


                    // no new shop
                } else {

                    if (req.body.clientData.buyWeight.pebble) {

                        if (req.user.wallet >= req.body.clientData.buyWeight.pebble) {

                            pebble.getReserve(function (reserve) {

                                users.findShopById(req.body.clientData.buyWeight.id, function (err, shop) {

                                    // if we get the shop
                                    if (shop) {

                                        // credit the reserve
                                        reserve.wallet += req.body.clientData.buyWeight.pebble;

                                        // debit the user
                                        req.user.wallet -= req.body.clientData.buyWeight.pebble;

                                        // rase weight
                                        shop.weight += req.body.clientData.buyWeight.pebble;

                                        // update the accounts
                                        reserve.save();
                                        //req.user.save();
                                        shop.save();

                                    }

                                });

                            });

                        }

                    }

                    done({

                        shopPage: shopPage
                        , maxPage: maxPage
                        , userShops: userShops

                    });

                }

            });

        });
      
};