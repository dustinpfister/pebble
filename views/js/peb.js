var post = function (data, done) {

        // new xhr
        var http = new XMLHttpRequest();

        done = done === undefined ? function (response) { console.log(response) } : done;

        // open a post
        http.open('POST', '/');

        //Send the proper header information along with the request
        http.setRequestHeader("Content-type", "application/json");

        // what to do on state change
        http.onreadystatechange = function () {

            if (this.readyState === 4) {

                done(JSON.parse(this.response));

            }

        };

        // send it out
        http.send(JSON.stringify(data));

        return 'sent post...';

    };


    var peb = (function () {

        
        var control = function () {


        };

        control.post = function (obj) {

            post(obj, function (response) {
        
                console.log(response);

            })

        },

        control.logout = function () {

            post({action: 'logout'});
            
            return 'peb.logout...';

        },
            
        control.login = function(username, password){
            
            post({action: 'login', username: username, password: password});
            
            return 'peb.login';
            
        };

        return control;

    }());