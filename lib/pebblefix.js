/*    pebblefix.js ( bash script )
 *
 *    this is a batch script that will fix the user accounts and the reserve in the event of 
 *    false sanity.
 *
 *    $ node pebbleFix.js
 */

// get users
var users = require('./users.js'),

// get pebble
pebble = require('./pebble.js'),
    
pebbleSum = 0,
sanity = true,
        
fix = function(){
    
    console.log('sanity check failed fixing...');  
    
};
    

// Check for sanity
pebble.getReserve(function (reserve) {

    var i, len;

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

        sanity = pebbleSum === reserve.worldTotal; 
        
        console.log('sanity:'+sanity);
        
        // if no sanity, fix
        if(!sanity){
        
            fix();
            
        }
        
        // kill script
        process.exit(0);

    });

});