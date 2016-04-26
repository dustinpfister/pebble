/*    pebbleCheck.js ( bash script )
 *
 *    this bash script checks the state of the user accounts, and the reserve and
 *    lets you know if everything is okay with the accounts
 *
 *    $ node pebbleCheck.js
 *    "worldTotal:1000,reserve wallet:1962,userSum:42,pebbleSum:2004,sanity:false"
 *
 *    pebbleCheck simply adds up the sum of all the pebbles (both the reserve and user accounts), 
 *    and reports the results. The sum of pebbles should equal the world total, if it does 
 *    then sanity = false.
 *
 *    pebbleCheck just simply checks, and reports the status of accounts, it does not fix anything 
 *    in the event of false sanity. 
 */

// get users
var users = require('./users.js'),

    // get pebble
    pebble = require('./pebble.js');

// get the reserve
pebble.getReserve(function (reserve) {

    var i, len, pebbleSum, stOut = '';

    // output the world total, and the reserves wallet
    stOut += '\"worldTotal:' + reserve.worldTotal + ',';
    stOut += 'reserve wallet:' + reserve.wallet + ',';

    // start off the pebble sum at the reserve wallets total
    pebbleSum = reserve.wallet
        , userSum = 0; // user sum shoud start at zero

    // get Users
    users.getUsers(function (users) {

        i = 0;
        len = users.length;

        // add up user totals
        while (i < len) {

            userSum += users[i].wallet;
            i++;
        }

        // add user sum to total
        pebbleSum += userSum;

        // output totals, and sanity bool.
        stOut += 'userSum:' + userSum + ',';
        stOut += 'pebbleSum:' + pebbleSum + ',';
        stOut += 'sanity:' + (pebbleSum === reserve.worldTotal) + '\"';

        // output
        console.log(stOut);

        // kill script
        process.exit(0);

    });

});