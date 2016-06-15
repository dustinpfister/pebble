// fulfiller.js for reserve_take


var pluginDefault = require('./pluginDefault.js').default;

exports.fulfill = function (scope, processed, done, fail) {

    if(done === undefined){ done = function(){}; }
    if(fail === undefined){ fail = function(){}; }

    console.log('fulfiller.js (reserve_take) : script called.');

    scope.users.pluginData(
        
        // getting the plugin data this way, to showcase the inportance of the fulfillerData property of TransactionProcessed.
        processed.fulfillerData.takeuser
        
        // pass the defult pluginData
        , pluginDefault

        // success getting plugin data
        ,function (plugData) {

            console.log('fulfiller.js (reserve_take) : here we have the plugin data');
            console.log(plugData);
            
            plugData.takeCount += 1;
            plugData.lastTake = new Date();
            
            scope.users.updatePluginData(processed.fulfillerData.takeuser, plugData, 
                    
                // success
                function(){
            
                
                    done(processed);

                
                },
                            
                // fail
                function(){
                
                    fail();
                
                }
            );
            

        },

        // fail getting plugin data.
        function () {

            console.log('fulfiller.js (reserve_take) : there was a problem getting the data');
            
            fail();

        }
        
    );

    

};