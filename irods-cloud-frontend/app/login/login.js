'use strict';

angular.module('myApp.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login/login.html',
    controller: 'loginCtrl'
  });
}])

.controller('loginCtrl', ['$scope', '$log', '$http', '$location', 'MessageService','globals','$q','$timeout',function ($scope, $log, $http, $location, MessageService, $globals, $q, $timeout) {
		var irodsAccount = function (host, port, zone, userName, password, authType, resource) {
		    return {
		        host: host,
		        port: port,
		        zone: zone,
		        userName: userName,
		        password: password,
		        authType: authType,
		        resource: resource

		    };
		};
        
        $('#main_contents').css('width','100%');
        $scope.close_intro = function () {
            $('.intro_screen').animate({'opacity': '0'},function(){
                $('.intro_screen').css('display','none');
            });
        };

        $scope.current_page = 'login';
        $scope.login = {};
        $scope.login.authType="STANDARD";
        $scope.submitLogin = function () {
            var actval = irodsAccount($scope.login.host, $scope.login.port, $scope.login.zone, $scope.login.userName, $scope.login.password, $scope.login.authType, "");
            
            $log.info("irodsAccount for host:" + actval);
            $http({
                method: 'POST',
                url: $globals.backendUrl('login/'),
                data: actval
                //headers: { 'Content-Type': 'application/json' }  // set the headers so angular passing info as request payload
            }).then(function (data) {
                    $log.info("login successful" + data);
                    // userService.setLoggedInIdentity(data);

                    var path = $globals.getLastPath();
                    return $q.when(path);

                }).then(function(path) {

                    if (!path) {
                        $log.info("hard code to go home");
                       path="/home/My Home";
                    } else {
                        // setpath
                        $log.info("setting location to last path:" + path);
                    }

                   // $timeout(function () {
                        $location.path(path);
                   // });

                    $log.info("end login success processing");

                });
        };

}]);