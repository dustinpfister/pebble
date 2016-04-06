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
    landSize: Number


})),
    
UserInfo = db.model('user_info',new Schema({
    
    infoID: String,
    userCount: Number
    
}));

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
  
    UserRec.findOne({'username': username}, 'wallet', function(err, user){
       
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
                        wallet : 0
                        
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