
exports.post = function(req, res, users, pebble){

// ALERT ! do we really need to do this for every post to / ?
    users.getUserSafe(req.user.username, function (user) {

        // pebblebar backend
        if (req.body.action === 'pebblebar') {

            // if we have pebbleAppName do what needs to be done for the app
            if (req.body.clientData) {

                // what we do depends on the app
                switch (req.body.clientData.pebbleAppName) {


                case 'home_client':

                    // send results of the take
                    res.send(JSON.stringify({
                        userData: user
                        , home: 'so you are home i see.'
                    }));

                    break;

                    // the reserve client at the /reserve path
                case 'reserve_client':

                    console.log('reserve client!');

                    // get the reserve object
                    pebble.getReserve(function (reserve) {

                        if (req.body.clientData.requested > 0) {

                            pebble.takeRequest(req.user.username, req.body.clientData.requested, function (wallet) {

                                // update user wallet with current amount
                                user.wallet = wallet;

                                // send results of the take
                                res.send(JSON.stringify({
                                    userData: user
                                    , reserve: reserve
                                    , takeWalletAfter: wallet
                                    , take: 'take complete'
                                }));

                            });

                        } else {

                            // send no take response
                            res.send(JSON.stringify({
                                userData: user
                                , reserve: reserve
                                , take: 'no take'
                            }));

                        }

                    });

                    break;


                case 'shops_client':


                        console.log('shops client');
                    //console.log(JSON.stringify(req.body));

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

                    break;

                default:

                    // send just the user data for pebblebar itself
                    res.send(JSON.stringify({
                        userData: user
                    }));


                    break;

                }


            } else {

                // send just the user data for pebblebar itself
                res.send(JSON.stringify({
                    userData: user
                }));

            }

        } else {

            // we have nothing to send
            res.send(null);

        }


    });
    
};