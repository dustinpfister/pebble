// create response method is called by pebblebars index.js
exports.createResponse = function (req, res, users, pebble, done) {

    console.log('reserve client request!');
    // get the reserve object

    users.getUserSafe(req.user.username, function (user) {

        pebble.getReserve(function (reserve) {

            if (req.body.clientData.requested > 0) {

                pebble.takeRequest(req.user.username, req.body.clientData.requested, function (wallet) {

                    // update user wallet with current amount
                    user.wallet = wallet;

                    // send results of the take
                    done({
                        reserve: reserve
                        , takeWalletAfter: wallet
                        , take: 'take complete'
                    });

                });

            } else {

                // send no take response
                done({
                    reserve: reserve
                    , take: 'no take'
                });

            }

        });


    });

};


exports.post = function (req, res, users, pebble) {

    console.log('reserve client request!');
    // get the reserve object

    users.getUserSafe(req.user.username, function (user) {

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


    });

};