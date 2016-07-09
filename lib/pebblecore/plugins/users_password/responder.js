var checks = [

  // check current password
  function (plugObj, user, done) {

            console.log('check 1');

            done();

  },

  // check if passwords equal each other  
  function (plugObj, user, done) {

            console.log('check 2');

            done();

  }

],

    processChecks = (function () {

        var c = 0
            , cLen = checks.length;

        return {

            reset: function () {

                c = 0;

            },

            process: function (plugObj, user, done) {

                var self = this;

                if (c < cLen) {

                    checks[c](plugObj, user, function (result) {

                        c += 1;

                        self.process(plugObj, user, done);

                    });

                } else {

                    done();

                }

            }

        };

    }());


exports.createResult = function (plugObj, scope, done, fail) {

    if (done === undefined) {
        done = function () {};
    }
    if (fail === undefined) {
        fail = function () {};
    }



    scope.users.findByUsername(scope.req.user.username, function (err, user) {


        if (user) {

            processChecks.reset();
            processChecks.process(plugObj, user, function () {

                done({

                    success: true
                    , mess: 'yes this is dog.'
                    , userPassword: user.password

                });

            });

        } else {

            fail({
                success: false
                , mess: 'could not get user.'
            });

        }


    });


};