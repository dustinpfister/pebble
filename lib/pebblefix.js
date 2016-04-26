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
    
// reset accounts based on % of wealth relative to invalid pebble sum    
fix = function(done){
    
    console.log('sanity check failed fixing...');  
    
    
    pebble.getReserve(function (reserve) {
        
        var pebbles = reserve.worldTotal;
        
        console.log('old reserve wallet: ' + reserve.wallet);
        
        // correct the reserve
        reserve.wallet = Math.floor( reserve.worldTotal * (reserve.wallet / pebbleSum) );
        
        pebbles -= reserve.wallet;
        
        console.log('new reserve wallet: ' + reserve.wallet);
        console.log('fixing user accounts with remaing pebble of: ' + pebbles + '...');
    
        // get Users
        users.getUsers(function (users) {
         
            users.forEach(function(user){
               
                // if we have pebbles to give
                if(pebbles > 0){
                
                    console.log('fixing wallet of user: ' + user.username + '...');
                    
                    console.log('old wallet total: ' + user.wallet);
                    
                    // fix user wallet
                    user.wallet = Math.floor( reserve.worldTotal * (user.wallet / pebbleSum) );
               
                    console.log('new wallet total:' + user.wallet );
                    
                    pebbles -= user.wallet;
                    
                    console.log('pebble remaining: ' + pebbles);
                    
                }
                
            });
            
            console.log('remaining pebble that will be added to reserve: ' + pebbles);
        
            // we are done
            done();
            
        });
        
        
    });
    
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
        
            fix(function(){
            
                process.exit(0);

            });
            
        }else{
        
            // kill script
            process.exit(0);

        }
    });

});