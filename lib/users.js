var mongoose = require('mongoose'),
openShift = require('./openshift.js').openShiftObj,
Schema = mongoose.Schema,

// pebble lib
pebble = require('./pebble.js'),
    
db = mongoose.createConnection(openShift.mongo),

UserRec = db.model('user_record', new Schema({

    // required 
    id: Number,
    username: String,
    password: String,   
    wallet: Number,
    
    maxShops : Number,
    shops : Array,
    landSize: Number


})),
    
UserInfo = db.model('user_info',new Schema({
    
    infoID: String,
    userCount: Number
    
})),
    
    

// SHOP Constructor  
Shop = function(json){
    
    this.shopName = 'buzzed mead\'s.';
    this.products = [
      
        {
            productName : 'MEAD',
            price: 10
            
        }
        
    ];
    
};

// find a user document by the given id
exports.findById = function(id,cb){
    UserRec.findOne({'id': id},'', function(err,user){
        if(user){
           return cb(null, user);
        }else{
            return cb(null,null);
        }
    });
};

// find a user document by the given username
exports.findByUsername = function(username, cb){
    UserRec.findOne({'username': username},'', function(err,user){
        if(user){
            return cb(null, user);
        }else{
            return cb(null,null);
        }
    });
};

// get a users NON SENSATIVE info that is okay to send out over http (no ssl)
exports.getUserSafe = function(username, done){
  
    UserRec.findOne({'username': username}, 'wallet maxShops shops', function(err, user){
       
        if(user){
            
            done(user);
            
        }else{
            
            done(null);
            
        }
        
    });
    
};


// create a new user info object if you don't find one.
exports.infoCheck = function(){
    
    // first check for the main user info record
    
    UserInfo.findOne({infoID:'main'},'', function(err, info){
        
        if(!info){
            
            info = new UserInfo({infoID:'main', userCount:0});
            info.save(function(){
                
                console.log('new user info object.');
                
            })
            
        }else{
            
            console.log('user info object found: we have ' + info.userCount + ' users.');
            
        }
        
    });
    
}

// set land based off the given pebble amount
exports.getLand = function(peb, done){
    
    var byRandom, byWorld, byEqual, size;
    
    
    console.log(pebble);
    
    pebble.getReserve(function(reserve){
        
        if(reserve){
            byRandom = Math.round( Math.random() * 90);
            byWorld = Math.round(Math.pow(600,peb / reserve.worldTotal));
            byEqual = peb > reserve.equalShare ? 300 : peb / reserve.equalShare * 300;
            size = 10 + byRandom + byEqual + byWorld;
            
            done(size);
            
        }else{
            
            done(10);
            
        }
        
        
    });
    
    
};

// create a new user with the given post request
exports.newUser = function(req, res){
    
    var newUser, self = this;
    
    // find if the user name is all ready in the database
    this.findByUsername(req.body.username, function(err, user){
        
        // if the user is not there it can be created
        if(!user){
            
            // get the main user info object
            UserInfo.findOne({infoID:'main'},'',function(err, info){
                
                if(info){
                    
                    newUser = new UserRec({
                        
                        username : req.body.username,
                        password : req.body.password,
                        wallet : 0,
                        maxShops : 3
                        
                    });
                    
                    newUser.id = info.userCount;
                    
                    self.getLand(0, function(size){
                    
                        newUser.landSize = size;
                        
                        info.userCount += 1;
                    
                        info.save(function(){
                       
                            newUser.save(function(){
                            
                                pebble.popChange(info.userCount);
                            
                                console.log('new user!');
                                console.log(newUser);
                            
                            });
                        
                        });
                        
                    });
                    
                }
                
            });  
            
        }else{
            
            console.log('user name is taken, new user not created.');
            
        }
        
    });
    
    
    res.redirect('/login');
    
};

// credit the given username's wallet with the given amount
exports.creditUser = function(username, amount, done){
      
    // find if the user name is all ready in the database
    this.findByUsername(username, function(err, user){
        
        if(user){
            
            user.wallet += amount;
            
            user.save(function(){
                    
                console.log('credited account ' + username + ' with ' + amount + ' pebbles. ');
                
                done(user.wallet)
                
            });
            
        }
        
    });
    
};

// call the given function for all users
exports.forAll = function(forUser){
    
    UserRec.find(function(err, users){
    
        users.forEach(function(user){
            
            forUser(user);
            
        });
        
    });
};

// call callback with users
exports.getUsers = function(done){
    
    UserRec.find(function(err, users){
        
            done(users);
            
    });
    
};

// start a new shop if the user has enough pebble
exports.startShop = function(username, done){
    
    
    
    /*
    
        * get the user account
        * check if the user has not exceaded max shops
        * check if the user has enough pebble for the shop
        * if they meat the requierments, make the new shop, and added it to there user account
        * no matter what send back a message to the client that says what the deal is.
    
    
    */
    
    // find the user
    this.findByUsername(username, function(err, user){
        
        if( user ){
            
            if( user.wallet >= 100 ){
            
                if( user.shops.length < user.maxShops ){
                
                    // looks good lets do this
                    /*
                    
                         * get the reserve account
                         * debit the user account
                         * credit the reserve account
                         * create the shop
                         * add the shop to the users shop array
                         * update the user record
                         * call done with the new shop.
                    
                    */
                    
                    // get the reserve
                    pebble.getReserve(function(reserve){
                    
                        if(reserve){
                        
                            // lets make a deal
                            user.wallet -= 100;
                            reserve.wallet += 100;
                            
                            var theShop = new Shop();
                            
                            user.shops.push(theShop);
                            
                            // update reserve, and user account
                            reserve.save(function(){
                            
                                user.save(function(){
                                
                                    done({ 
                             
                                        mess: 'looks good lets give you one...',
                                        theShop : theShop
                                        
                                    });
                                    
                                });
                                
                            });
                    
                        }else{
                            
                            done({mess: 'no reserve!?'});
                            
                        }
                            
                    });
                    
                    
                    
                }else{
                    
                    done({mess: 'to many shops sell one'});
                
                }
                
            }else{
            
                done({mess: 'sorry, you do not have the pebble.'})
            
                
            }
            
        }else{
            
            
            done({mess: 'user not found.'});
            
        }
        
        
    });
    
    
    
};


// debit a users wallet by the given amount
exports.debitUser = function(username, amount, done){
    
    // find the user
    this.findByUsername(username, function(err, user){
        
        // if found debit
        if(user){
            
            if(user.wallet >= amount){
        
                user.wallet -= amount;
            
                user.save(function(){
                    
                    console.log('debited account ' + username + ' with ' + amount + ' pebbles. ');
                
                    done(user.wallet)
                
                });
                
            }
            
        }
        
    });
    
};