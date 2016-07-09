/*
 *    pebble.js for Pebble (https://github.com/dustinpfister/pebble)
 *    copyright 2016 by Dustin Pfister GPL v3
 *
 *    This file contains many of the core mechanics of the Pebble Project ( mainly the reserve object, and accounts )
 *
 */

var mongoose = require('mongoose'), openShift = require('./openshift.js').openShiftObj, Schema = mongoose.Schema,

// users
users = require('./users.js'),

// fulfiller
fulfiller = require('./pebblebar/fulfiller.js');

db = mongoose.createConnection(openShift.mongo),

Reserve = db.model('reserve', {

        id : String, // the id of the reserve record 'main' is what is used in the game.
        worldTotal : Number, // total world pebbles

        // account
        accountNumber : String, // an account number that sets the reserve appart from other accounts
        wallet : Number, // the number of pebbles in the reserve account

        // population
        population : Number, // the current world population ( number of users )
        equalShare : Number, // what an equal share of the total world pebbles is.

        // responders
        responders : [], // an array of pebblebar plugins that have responder.js files.

        // sanity
        sanity : {

            lastCheck : String, // timeStamp of the last time sanity was checked

            history : [{

                    // account info (reserve and accounts)
                    worldTotal : Number,
                    pebbleSum : Number,
                    accountTotal : Number,
                    reserveWallet : Number,

                    // result
                    sain : Boolean, // pass or fail of sanity check
                    checkDone : String, // timeStamp for when the check was preformed
                    action : String // the action taken

                }

            ]
        }

    }),

// the account model
Account = db.model('account', {

        accountNumber : String, // an unique number that id's the account
        wallet : Number, // the account balance
        owners : []// a list of owners of the account

    }),

TransferRequest = db.model('transfer_request', {

        transferNumber : String, // the transfer number
        fromAccount : String, // the accountNumber of the account that pebble is being transfered from
        toAccount : String, // the accountNumber of the account that pebble is being transfered to
        amount : Number, // the amount of pebble to transfer
        status : String, // the status of the transfer (pending, success, fail)
        fulfillerPlugin : String, // the name of a plugin that has a fulfiller.js file to call when processed.
        fulfillerData : {}
    }),

TransferProcessed = db.model('transfer_processed', {

        transferNumber : String, // the transfer number
        amount : Number, // the amount of pebble to transfer
        status : String, // the status of the transfer (success or fail only if processed)
        messCode : Number, // a code that will get a message saying what happened,
        fulfillerPlugin : String,
        fulfillerData : {}

    }),

// check account reference aurgment, and get the account if you don't all ready have it
// used in pebble.transfer()
accountRefCheck = function (accountRef, done, fail) {

    if (done === undefined) {
        done = function () {};
    }
    if (fail === undefined) {
        fail = function () {};
    }

    // if object
    if (typeof accountRef === 'object') {

        // if wallet assume it is all ready an account collection or reserve object.
        if (!(accountRef.wallet === undefined)) {

            done(accountRef);

        } else {

            // assume getBy prop
            switch (accountRef.getBy) {

                // if username get user prime account via username property
            case 'username':

                // get user prime account
                users.getUserPrime(

                    accountRef.username,

                    // done
                    function (account) {

                    done(account);

                },

                    // fail
                    function (mess) {

                    fail(mess)

                });

                break;

                // if accountNumber we will be getting the account by it's number
            case 'accountNumber':

                exports.getAccount(accountRef.accountNumber,

                    // done
                    function (account) {

                    done(account);

                },

                    // fail
                    function (mess) {

                    fail(mess);

                });

                break;

                // if reserve we will be getting the reserve account
            case 'reserve':

                // get the reserve account
                exports.getReserve(function (account) {

                    done(account);

                });

                break;

            }

        }

        // if not an object
    } else {

        // if reserve
        if (accountRef === 'reserve') {

            // get the reserve account
            exports.getReserve(function (account) {

                done(account);

            });

            // assume an account number
        } else {

            // ALERT! we dont have a fail callback for pebble.getAccount?
            exports.getAccount(accountRef,

                // done
                function (account) {

                done(account);

            },

                // fail
                function (mess) {

                fail(mess);

            });

        }

    }

};

// clear responders array
exports.clearResponders = function (done) {

    if (done === undefined) {
        done = function () {};
    }

    this.getReserve(function (reserve) {

        reserve.responders = [];

        reserve.save(function () {

            done();

        });

    });

};

// set the given plugin name to the responder array
exports.pushResponder = function (pluginName) {

    this.getReserve(function (reserve) {

        reserve.responders.push(pluginName);

        reserve.save(function () {});

    });

};

// create an account
exports.createAccount = function (owner, done) {

    var newAccount = new Account({

            accountNumber : new Date().getTime(),
            wallet : 0,
            owners : [owner]

        });

    newAccount.save(function () {

        done(newAccount.accountNumber);

    });

};

// get an account by its number
exports.getAccount = function (number, done, fail) {

    if (done === undefined) {
        done = function () {};
    }
    if (fail === undefined) {
        fail = function () {};
    }

    Account.findOne({
        accountNumber : number
    }, '', function (err, account) {

        if (err) {

            fail('there was an error getting the account.');

        } else {

            if (account) {

                done(account);

            } else {

                fail('account not found.');

            }

        }

    });

};

// get all the pebble accounts
exports.getAllAccounts = function (done) {

    Account.find({}, '', function (err, accounts) {

        done(accounts);

    });

};

// get a traansfer message from a messCode
/*
exports.getTransferMessgae = function (messCode) {

switch (messCode) {

case 4:
return 'Same account transfer.';
break;
case 3:
return 'Not enough pebble.';
break;
case 2:
return 'Count not get account.';
break;
case 1:
return 'Generic message\/error code. Or no message code set.';
break;
case 0:
return 'Sucessful transfer.';
break;

}

};
 */

// create a TransferProcessed instance, push it to the database, and purge the TransferRequest
exports.pushTransfer = function (transReq, aurg, done) {

    if (aurg === undefined) {
        aurg = {};
    }
    if (aurg.messCode === undefined) {
        aurg.messCode = 0;
    }
    if (aurg.status === undefined) {
        aurg.status = 'fail';
    }

    // create the Transfer Processed instance
    var processed = new TransferProcessed({

            transferNumber : transReq.transferNumber,
            amount : transReq.amount,
            status : aurg.status,
            messCode : aurg.messCode,
            fulfillerPlugin : transReq.fulfillerPlugin,
            fulfillerData : transReq.fulfillerData

        });

    processed.save(function () {

        TransferRequest.remove({
            transferNumber : transReq.transferNumber
        }, function (err) {

            done();

        });

    });

};

// process the next transfer request
exports.processNext = (function () {

    var locked = false,
    self = this,
    fromAccount,
    toAccount;

    return function () {

        var self = this;

        if (!locked) {

            // do not process any other transfers until unlocked
            locked = true;

            TransferRequest.findOne({}, {}, {
                sort : {
                    'created_at' : -1
                }
            }, function (err, transReq) {

                if (transReq) {

                    // check the fromAccount aurg and fix
                    accountRefCheck(transReq.fromAccount,

                        // done
                        function (fix) {

                        fromAccount = fix;

                        // check the toAccount aurg and fix
                        accountRefCheck(transReq.toAccount,

                            // done
                            function (fix) {

                            toAccount = fix;

                            if (fromAccount.wallet >= transReq.amount) {

                                // fail if same account number
                                if (fromAccount.accountNumber === toAccount.accountNumber) {

                                    // not enough pebble
                                    self.pushTransfer(
                                        transReq, {
                                        status : 'fail',
                                        messCode : 4

                                    }, function () {

                                        locked = false;
                                    });

                                    // else make the transfer
                                } else {

                                    fromAccount.wallet -= transReq.amount;
                                    toAccount.wallet += transReq.amount;

                                    fromAccount.save(function () {

                                        toAccount.save(function () {

                                            // transfer
                                            self.pushTransfer(
                                                transReq, {
                                                status : 'success',
                                                messCode : 0

                                            }, function () {

                                                locked = false;
                                            });

                                        });

                                    });

                                }

                            } else {

                                // not enough pebble
                                self.pushTransfer(
                                    transReq, {
                                    status : 'fail',
                                    messCode : 3

                                }, function () {

                                    locked = false;
                                });

                            }

                        },

                            // fail getting to account
                            function () {

                            self.pushTransfer(
                                transReq, {
                                status : 'fail',
                                messCode : 2

                            }, function () {

                                locked = false;
                            });

                        });

                    },

                        // fail geting from account
                        function () {

                        self.pushTransfer(
                            transReq, {
                            status : 'fail',
                            messCode : 2

                        }, function () {

                            locked = false;
                        });

                    });

                    // no work to do
                } else {

                    locked = false;

                }

            });

        }

    };

}
    ());

exports.fulfillNext = function () {

    TransferProcessed.findOne({}, {}, {
        sort : {
            'created_at' : -1
        }
    }, function (err, processed) {

        if (processed) {

            fulfiller.fulfill(processed, function (processed) {

                TransferProcessed.remove({
                    transferNumber : processed.transferNumber
                }, function (err) {


                });

            },
                function () {


            });

        }

    });

};

// request a transfer of pebbles from one account to another
exports.transferRequest = (function () {

    var count = 0;

    return function (options) {

        var self = this,
        fromAccount,
        toAccount;

        if (options.done === undefined) {
            options.done = function () {};
        }
        if (options.fail === undefined) {
            options.fail = function () {};
        }
        if (options.fulfillerPlugin === undefined) {
            options.fulfillerPlugin = 'none';
        }
        if (options.fulfillerData === undefined) {
            options.fulfillerData = {
                noData : true
            };
        }

        // check the fromAccount aurg and fix
        accountRefCheck(options.from, function (fix) {

            fromAccount = fix;

            // check the toAccount aurg and fix
            accountRefCheck(options.to,

                // done
                function (fix) {

                toAccount = fix;

                // logg the request
                var transfer = new TransferRequest({

                        transferNumber : 'c' + count + ':t' + new Date().getTime(),
                        fromAccount : fromAccount.accountNumber,
                        toAccount : toAccount.accountNumber,
                        amount : options.amount,
                        status : 'pending',
                        fulfillerPlugin : options.fulfillerPlugin,
                        fulfillerData : options.fulfillerData

                    });

                transfer.save(function () {

                    options.done({
                        mess : 'transfer requested.'
                    });

                });

                count += 1;

                // count loops back to zero every now and then
                if (count >= 10000) {

                    count = 0;

                }

            },

                // fail
                function (mess) {

                options.fail({
                    mess : mess
                });

            });

        },

            function (mess) {

            options.fail({
                mess : mess
            });

        });

    };

}
    ());

// check for the reserve account and create it if it is not there
exports.reserveCheck = function (done) {

    if (done === undefined) {
        done = function () {};
    }

    Reserve.findOne({
        id : 'main'
    }, '', function (err, reserve) {

        if (reserve) {

            done(reserve);

        } else {

            reserve = new Reserve({

                    id : 'main',
                    worldTotal : 1000,
                    equalShare : 1000,
                    population : 0,
                    accountNumber : 'reserve',
                });

            reserve.wallet = reserve.worldTotal;
            reserve.responders = [];
            reserve.sanity = {

                lastCheck : String(new Date()),
                history : []

            };

            reserve.save(function () {

                done(reserve);

            });

        }

    });

};

// just get the reserve
exports.getReserve = function (done) {

    Reserve.findOne({
        id : 'main'
    }, '', function (err, reserve) {

        if (reserve) {

            done(reserve);

        } else {

            done(null);

        }

    });

};

// population has changed to the given population
exports.popChange = function (population) {

    Reserve.findOne({
        id : 'main'
    }, '', function (err, reserve) {

        if (reserve) {

            // update population and equal share
            reserve.population = population;
            reserve.equalShare = reserve.worldTotal / reserve.population;

            reserve.save(function () {

            });

        }

    });

};

// sanity check
exports.sanityCheck = function (done) {

    var report = {

        checkDone : new Date(),
        accountTotal : 0

    };

    // get the reserve
    this.getReserve(function (reserve) {

        // find accounts total
        Account.find({}, function (err, accounts) {

            var i = 0,
            len = accounts.length;
            while (i < len) {

                report.accountTotal += accounts[i].wallet;

                i += 1;

            }

            report.reserveWallet = reserve.wallet;
            report.pebbleSum = report.reserveWallet + report.accountTotal;

            // reset the clock
            reserve.sanity.lastCheck = String(report.checkDone);

            // shift out old reports
            if (reserve.sanity.history.length >= 10) {

                reserve.sanity.history.shift();

            }

            // set the world total
            report.worldTotal = reserve.worldTotal;

            // set the sain bool of the report
            report.sain = report.pebbleSum === report.worldTotal

                // for now action will always be 'none';
                report.action = 'none';

            // push the report
            reserve.sanity.history.push(report);

            reserve.save(function () {

                done(report);

            });

        });

    });

};
