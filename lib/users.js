/*
 *    users.js for Pebble (https://github.com/dustinpfister/pebble)
 *    copyright 2016 by Dustin Pfister GPL v3
 *
 *    As the name suggests this file is responsible for creation and maintenance of user records.
 *
 */

var mongoose = require('mongoose'), openShift = require('./openshift.js').openShiftObj, Schema = mongoose.Schema,

// pebble lib
pebble = require('./pebble.js'),

db = mongoose.createConnection(openShift.mongo),

// user record collection
UserRec = db.model('user_record', new Schema({

            // indenity and loggin
            id : Number,
            username : String,
            password : String

            // pebble accounts
        ,
            accounts : []// the accounts array is to replace wallet
        ,
            primeAccount : String // the account number of the users primeAccount

            // user activity
        ,
            lastCheckIn : String

            // plugins
        ,
            pluginData : []

        })),

// user Info collction
UserInfo = db.model('user_info', new Schema({

            infoID : String,
            userCount : Number

        }));

// just get the index of the plugin of the given plugin name. Return -1 if not found
exports.getPlugIndex = function (username, pluginName, done) {

    var index = -1;

    // find the user
    this.findByUsername(username, function (err, user) {

        var i,
        len;

        // if we find the user
        if (user) {

            i = 0,
            len = user.pluginData.length;

            // loop to find plugin
            while (i < len) {

                if (user.pluginData[i].plugin === pluginName) {

                    index = i;
                    break;

                }

                i++;
            }

            // return index of plugin of -1
            done(index);

            // else if no user
        } else {

            // return -1;
            done(index);

        }

    });

};

// get the pluginData for the given pluginData object, or create it if it does not exsist, and return a reference to it.
exports.pluginData = function (username, defaultPluginData, done, fail) {

    var self = this;

    if (done === undefined) {
        done = function () {};
    }
    if (fail === undefined) {
        fail = function () {};
    }

    this.findByUsername(username, function (err, user) {

        // fail becuase of an error
        if (err) {

            fail(err)

        } else {

            // if user
            if (user) {

                var i = 0,
                len = user.pluginData.length;
                while (i < len) {

                    // if we find it then retun what we all ready have
                    if (user.pluginData[i].plugin === defaultPluginData.plugin) {

                        done(user.pluginData[i]);
                        break;
                    }

                    i++;
                }

                // if we dont have it make it.
                if (i === len) {

                    user.pluginData.push(defaultPluginData);

                    user.save(function () {

                        // call again this time it should get the new pluginData
                        self.pluginData(username, defaultPluginData, done, fail);

                    });

                }

                // else fail becuase the user was not found
            } else {

                fail();

            }

        }

    });

};

// update the given pluginData with the given pluginData object
exports.updatePluginData = function (username, updatedData, done, fail) {

    if (done === undefined) {
        done = function () {};
    }
    if (fail === undefined) {
        fail = function () {};
    }

    this.findByUsername(username, function (err, user) {

        // fail becuase of an error
        if (err) {

            fail(err)

        } else {

            // if user
            if (user) {

                var i = 0,
                len = user.pluginData.length;

                while (i < len) {

                    // if we find it then retun what we all ready have
                    if (user.pluginData[i].plugin === updatedData.plugin) {

                        user.pluginData[i] = updatedData;
                        user.markModified('pluginData');

                        user.save(function () {

                            done();

                        });

                        break;
                    }

                    i++;
                }

                // fail becuase we did not find any data to update
                if (i === len) {

                    fail();

                }

                // else fail becuase the user was not found
            } else {

                fail();

            }

        }

    });

};

exports.checkIn = function (username, done) {

    this.findByUsername(username, function (err, user) {

        user.lastCheckIn = new Date().toString();

        user.save(function () {

            done({

                mess : 'check in compleate for user ' + username,
                lastCheckIn : user.lastCheckIn
            });

        });

    });

},

// find a user document by the given id
exports.findById = function (id, cb) {
    UserRec.findOne({
        'id' : id
    }, '', function (err, user) {
        if (user) {
            return cb(null, user);
        } else {
            return cb(null, null);
        }
    });
};

// find a user document by the given username
exports.findByUsername = function (username, cb) {
    UserRec.findOne({
        'username' : username
    }, '', function (err, user) {
        if (user) {
            return cb(null, user);
        } else {
            return cb(null, null);
        }
    });
};

// get a users NON SENSATIVE info that is okay to send out over http (no ssl)
exports.getUserSafe = function (username, done) {

    var self = this,

    userSafe = {};

    UserRec.findOne({
        'username' : username
    }, '', function (err, user) {

        if (user) {

            self.getUserPrime(username, function (account) {

                userSafe = user;
                userSafe.primeWallet = account.wallet;

                userSafe = {

                    username : user.username,
                    lastCheckIn : user.lastCheckIn,
                    primeWallet : account.wallet,
                    id : user.id

                };

                done(userSafe);

            });

        } else {

            done(null);

        }

    });

};

// create a new user info object if you don't find one.
exports.infoCheck = function (done) {

    if (done === undefined) {
        done = function () {};
    }

    // first check for the main user info record
    UserInfo.findOne({
        infoID : 'main'
    }, '', function (err, info) {

        if (!info) {

            info = new UserInfo({
                    infoID : 'main',
                    userCount : 0
                });
            info.save(function () {

                done(info);

            })

        } else {

            done(info);
        }

    });

}

// create a new user with the given post request
exports.newUser = function (req, done, fail) {

    var newUser,
    self = this;

    if (done === undefined) {
        done = function () {};
    }
    if (fail === undefined) {
        fail = function () {};
    }

    if (req.body.username.length === 0) {

        fail({

            mess : 'the length of the username given is zero'

        })

    } else {

        // find if the user name is all ready in the database
        this.findByUsername(req.body.username, function (err, user) {

            // if the user is not there it can be created
            if (!user) {

                // get the main user info object
                UserInfo.findOne({
                    infoID : 'main'
                }, '', function (err, info) {

                    if (info) {

                        pebble.createAccount(req.body.username, function (accountNumber) {

                            newUser = new UserRec({

                                    username : req.body.username,
                                    password : req.body.password,
                                    accounts : [accountNumber],
                                    primeAccount : accountNumber,
                                    pluginData : [],
                                    lastCheckIn : new Date().toString()

                                });

                            newUser.id = info.userCount;

                            info.userCount += 1;

                            info.save(function () {

                                newUser.save(function () {

                                    pebble.popChange(info.userCount);

                                    done();

                                });

                            });

                        });

                    }

                });

            } else {

                fail({
                    mess : 'username is taken.'
                });

            }

        });

    }

};

// get the users prime pebble account
exports.getUserPrime = function (username, done, fail) {

    this.findByUsername(username, function (err, user) {

        if (user) {

            pebble.getAccount(user.primeAccount, function (account) {

                done(account);

            });

        } else {

            fail({
                status : 'users.getUserPrime: user not found!'
            });

        }

    });

};

// credit a users prime account from the given account
exports.creditUserPrime = function (fromAccount, username, amount, done) {

    // find the user rec
    this.findByUsername(username, function (err, user) {

        if (user) {

            pebble.getAccount(user.primeAccount, function (account) {

                // make the transfer
                pebble.transfer(fromAccount, account, amount, function (wallet) {

                    done(wallet)

                });

            });

        }

    });

};

// call the given function for all users
exports.forAll = function (forUser) {

    UserRec.find(function (err, users) {

        users.forEach(function (user) {

            forUser(user);

        });

    });
};

// call callback with users
exports.getUsers = function (done) {

    UserRec.find(function (err, users) {

        done(users);

    });

};
