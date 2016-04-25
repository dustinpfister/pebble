exports.post = function (req, res, users, pebble) {

    console.log('home client request!');

    // get the safe to send userdata
    users.getUserSafe(req.user.username, function (user) {

        // send results of the take
        res.send(JSON.stringify({
            userData: user
            , home: 'so you are home i see.'
        }));

    });

};