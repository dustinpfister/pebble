
var ShopBase;


// what should be done on plugin setup?
exports.setup = function(db){
    
    ShopBase = db.model('shop', new Schema({

        // Basic shop info
        id: String, // the id of the stop
        shopName: String, // the name of the shop
        shopOwner: String, // the username of the player that owns the shop.

        // Weight (weight effects the shop rank on the shop list?)
        weight: Number,

        // type
        shopType: String,

        // Production (what products are being produced and the rate at which they are made)
        production: [

            {
                productName: String, // the name of the product to produce
                lastMade: String, // a time stamp that reflects the last time production occured.
                rate: Number // the amount of time that needs to pass until one unit of the procuct is made

        }

    ],

        // For Sale
        forSale: [ // products that are for sale to anyone who wants them.
            {
                productName: String, // the product name (food, oil, water, wood, ect)
                pebbleCost: Number // the amount of pebble needed to buy the product from the shop owner.
        }
    ]
        , forSaleLimit: Number

    }));
    
};