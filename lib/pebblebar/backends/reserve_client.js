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