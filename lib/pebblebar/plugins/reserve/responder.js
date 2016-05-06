// create response method is called by pebblebars index.js
exports.responder = function (req, res, users, pebble, done) {

    if (req.body.clientData.requested > 0) {

        pebble.takeRequest(req.user.username, req.body.clientData.requested, function (wallet) {

            // send results of the take

            pebble.getReserve(function (reserve) {

                done({
                    reserve: reserve
                    , takeWalletAfter: wallet
                    , take: 'take complete'
                });

            });

        });

    } else {

        // send no take response
        pebble.getReserve(function (reserve) {
            done({
                reserve: reserve
                , take: 'no take'
            });
        });

    }

};