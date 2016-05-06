/*    shops client pebblebar backend
 *
 */

var shops = require('./shops.js');

// get the shops page
var getShopPage = function (req, res, users, pebble, doneObj, done) {

    
    
        shops.getShopPage(req.body.clientData.shopPage, function (shopPage, maxPage) {

            doneObj.shopPage = shopPage;
            doneObj.maxPage = maxPage;


            newShopCheck(req, res, users, pebble, doneObj, done);

        });

    },


    // check for new shop request
    newShopCheck = function (req, res, users, pebble, doneObj, done) {


        // if new shop requested
        if (req.body.clientData.newShop) {

            users.startShop(req.user.username, function (shopObj) {

                doneObj.newShop = shopObj;

                getUserShops(req, res, users, pebble, doneObj, done);



            });


            // no new shop
        } else {

            getUserShops(req, res, users, pebble, doneObj, done);

        }

    },

    // get user shops
    getUserShops = function (req, res, users, pebble, doneObj, done) {

        // get user shops
        shops.getUsersShops(users, req.user.username, function (userShops) {

            // append user shops to doneObj
            doneObj.userShops = userShops;


            //done(doneObj);

            buyWeight(req, res, users, pebble, doneObj, done);

            
        });

    },

    
    buyWeight = function (req, res, users, pebble, doneObj, done) {


        // buying weight for a shop?
        if (req.body.clientData.buyWeight.pebble) {

            users.getUserPrime(req.user.username, function (userAccount) {
            
            if (userAccount.wallet >= req.body.clientData.buyWeight.pebble) {

                //pebble.getReserve(function (reserve) {

                    shops.findShopById(req.body.clientData.buyWeight.id, function (err, shop) {

                        // if we get the shop
                        if (shop) {

                            /*
                            // credit the reserve
                            reserve.wallet += req.body.clientData.buyWeight.pebble;

                            // debit the user
                            req.user.wallet -= req.body.clientData.buyWeight.pebble;

                            // rase weight
                            shop.weight += req.body.clientData.buyWeight.pebble;

                            // update the accounts
                            reserve.save();
                            req.user.save();
                            shop.save();
                            
                            //done(doneObj);

                            */
                            
                            // make the transfer
                           pebble.transfer(
                               {getBy: 'username', username: req.user.username}, 
                               {getBy: 'reserve'}, 
                               req.body.clientData.buyWeight.pebble, 
                               function (toWallet) {

                                   shop.weight += req.body.clientData.buyWeight.pebble;
                                   shop.save(function(){
                                   
                                       buyItemsCheck(req, res, users, pebble, doneObj, done);
                                   
                                   });
                                       
                               }
                           );

                        }

                    });

                //});

            // no new weight becuase the player does not have the pebble
            }else{
                
                buyItemsCheck(req, res, users, pebble, doneObj, done);
                
            }

            });
                
        // no new weight
        }else{
            
            buyItemsCheck(req, res, users, pebble, doneObj, done);
            
        }

    },
    
    // check for any items the player wants to buy
    buyItemsCheck = function(req, res, users, pebble, doneObj, done){
        
        //console.log(req.body);
        
        if(req.body.clientData.buyItems.length > 0){
          
            //console.log('items requested!');
            //console.log(req.body.clientData.buyItems);
            
            shops.buyShopItems(req.user.username, req.body.clientData.buyItems, function(){
            
                done(doneObj);
                
            });
        
        // no items requested
        }else{
        
            done(doneObj);
        
        }
    };


// the responder for the shops plugin
exports.responder = function (req, res, users, pebble, done) {

    // the done obj is what is passed to the done callback
    var doneObj = {};

    getShopPage(req, res, users, pebble, doneObj, done);

};
