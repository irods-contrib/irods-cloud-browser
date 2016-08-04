/**
 *
 * Defines interceptors for auth and error handling with the REST back end
 * Created by mikeconway on 3/7/14.
 *
 *
 */

angular.module('httpInterceptorModule', []).factory('myHttpResponseInterceptor', ['$q', '$location', '$log', 'MessageService', 'globals', function ($q, $location, $log, MessageService, globals) {
    return {
        // On request success
        request: function (config) {
            // console.log(config); // Contains the data about the request before it is sent.
            $('.spinning_wheel').fadeIn();
            // Return the config or wrap it in a promise if blank.
            return config || $q.when(config);
        },

        // On request failure
        requestError: function (rejection) {
            console.log(rejection); // Contains the data about the error on the request.

            // Return the promise rejection.
            return $q.reject(rejection);
        },

        // On response success
        response: function (response) {
            // console.log(response); // Contains the data from the response.
            $('.spinning_wheel').fadeOut();
            $log.info(response);
            /* if (response.config.method.toUpperCase() != 'GET') {
             messageCenterService.add('success', 'Success');
             }*/

            // Return the response or promise.
            return response || $q.when(response);
        },

        // On response failure
        responseError: function (rejection) {
            console.log(rejection); // Contains the data about the error.
            $log.error(rejection);
            var status = rejection.status;
            $log.info("status for rejection:" + status);
            $('.spinning_wheel').fadeOut();
            if (status == 0) {

            } else if (status == 500) {
                $log.info("internal server error");
                if($location.path() == "/search"){
                    
                }else{
                    // todo: fix for no vc found
                    if (rejection.data.error.localizedMessage.startsWith("no virtual collections")) {
                        $location.path("/home/My Home");
                    }

                    globals.setLastPath($location.path());
                    //$location.path("/index");
                    //if (globals.loggedInIdentity != null) {

                    var message = rejection.data.error.localizedMessage;
                    if (!message) {
                        message = "An error occurred";
                    }

                    MessageService.error(message);

                    return $q.reject(rejection);
                }
            } else if (status == 401) { // unauthorized - redirect to login again
                //save last path for subsequent re-login
                if ($location.path() != "/login") {
                    $log.info("intercepted unauthorized, save the last path");
                    globals.setLastPath($location.path());
                    $log.info("saved last path:" + $location.path());
                    MessageService.warn("Please log in"); // FIXME: i18n
                }

                $location.path("/login");
            } else if (status == 400) { // validation error display errors
                //alert(JSON.stringify(rejection.data.error.message)); // here really we need to format this but just showing as alert.
                var len = rejection.data.errors.errors.length;
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        MessageService.warn(rejection.data.errors.errors[i].message);
                    }
                }

                return $q.reject(rejection);

            } else {
                // otherwise reject other status codes
                if (rejection && rejection.data) {

                    if (rejection.data.error) {
                        var msg = rejection.data.error.localizedMessage;
                    }

                    if (!msg || msg == null) {
                        msg = "unknown exception occurred";  //FIXME: i18n
                    }
                    $log.error("unknown exception, message is:" + msg);
                    MessageService.error(msg);
                } else {
                    var msg = "unknown exception occurred";  //FIXME: i18n
                    $log.error("unknown exception, but with rejection, which was:" + rejection.data);
                    MessageService.error(msg);
                }
            }


            return $q.reject(rejection);
        }
        // Return the promise rejection.
        //return $q.reject(rejection);
    }

}])//Http Intercpetor to check auth failures for xhr requests
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('myHttpResponseInterceptor');

        /* configure xsrf token
         see: http://stackoverflow.com/questions/14734243/rails-csrf-protection-angular-js-protect-from-forgery-makes-me-to-log-out-on
         */


    }]);