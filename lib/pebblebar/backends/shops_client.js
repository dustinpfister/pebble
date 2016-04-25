exports.post = function (req, res, users, pebble) {

    console.log('shops client request!');

    // get the safe to send userdata
    users.getUserSafe(req.user.username, function (user) {

        // get the shops page
        users.getShopPage(req.body.clientData.shopPage, function (shopPage, maxPage) {

            // get user shops
            users.getUsersShops(req.user.username, function (userShops) {

                // if new shop requested
                if (req.body.clientData.newShop) {

                    console.log('new shop request');

                    users.startShop(req.user.username, function (shopObj) {

                        // get the shop page
                        //users.getShopPage(req.body.clientData.shopPage, function (shopPage, maxPage) {

                        res.send(JSON.stringify({

                            userData: user
                            , shopPage: shopPage
                            , maxPage: maxPage
                            , newShop: shopObj
                            , userShops: userShops

                        }));

                        //});

                    });


                    // no new shop
                } else {

                    // get the shop page
                    //users.getShopPage(req.body.clientData.shopPage, function (shopPage, maxPage) {

                    if (req.body.clientData.buyWeight.pebble) {

                        if (user.wallet >= req.body.clientData.buyWeight.pebble) {

                            pebble.getReserve(function (reserve) {



                                console.log('the shop id we need to get: ' + req.body.clientData.buyWeight.id);

                                users.findShopById(req.body.clientData.buyWeight.id, function (err, shop) {

                                    console.log(shop);

                                    // if we get the shop
                                    if (shop) {

                                        // credit the reserve
                                        reserve.wallet += req.body.clientData.buyWeight.pebble;

                                        // debit the user
                                        user.wallet -= req.body.clientData.buyWeight.pebble;

                                        // rase weight
                                        shop.weight += req.body.clientData.buyWeight.pebble;

                                        // update the accounts
                                        reserve.save();
                                        user.save();
                                        shop.save();

                                    }

                                });



                            });

                        }


                    }


                    res.send(JSON.stringify({

                        userData: user
                        , shopPage: shopPage
                        , maxPage: maxPage
                        , userShops: userShops

                    }));

                    //});

                }

            });

        });

    });

};