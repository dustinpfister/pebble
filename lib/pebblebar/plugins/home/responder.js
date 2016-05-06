
// the responder for the home plugin
exports.responder = function (req, res, users, pebble, done) {
  
    console.log('home responder!');

    // send results of the take
    done({
        home: 'so you are home i see.'
    });
    
};