var users = require('./users.js'),

    // pebble lib
    pebble = require('./pebble.js');




pebble.getReserve(function(reserve){
    
    var i,len, pebbleSum;
    
    console.log('world total : ' + reserve.worldTotal);
    console.log('reserve wallet : ' + reserve.wallet);  

    pebbleSum = reserve.wallet;
    
    users.getUsers(function(users){
        
        i = 0;
        len = users.length;
        
        while(i < len){
            
            console.log(users[i].username + '\'s wallet : ' + users[i].wallet);
            
            pebbleSum += users[i].wallet;
            
            i++;
        }
        
        console.log('pebbleSum : ' + pebbleSum);
        console.log('sanity : ' + (pebbleSum === reserve.worldTotal));
        
        process.exit(0);
        
    });
        
});


