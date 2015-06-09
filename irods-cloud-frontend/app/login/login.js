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

        $scope.animate_ir = function () {            
            var mouse_x = event.pageX;
            var mouse_y = event.pageY;
            var elem = $('.page_center');
            var shadow_distor = Math.floor(Math.sqrt(Math.pow(mouse_x - (elem.offset().left+(elem.width()/2)), 2) + Math.pow(mouse_y - (elem.offset().top+(elem.height()/2)), 2)));
            $('.intro_screen_ir_shadow').css('width',(shadow_distor/8)+ 100 + 'px');
            $('.intro_screen_ir_shadow').css('opacity',1-(shadow_distor/700));
            $('.intro_screen_ir').css('opacity',0.3+(shadow_distor/700));
            var shadow_width = $('.intro_screen_ir_shadow').width();
            

            var icon_y = ((elem.offset().top - mouse_y)/2) - 50;
            $('.intro_screen_ir').css('top',icon_y + 'px');
            $('.intro_screen_ir_white').css('top',icon_y + 'px');
            var icon_x = ((elem.offset().left - mouse_x)/2) - 50;
            $('.intro_screen_ir').css('left',icon_x + 'px');
            $('.intro_screen_ir_white').css('left',icon_x + 'px');

            var shadow_y = (((elem.offset().top - mouse_y)*1.5)/2) - (shadow_width/2);
            $('.intro_screen_ir_shadow').css('top',shadow_y + 'px');
            var shadow_x = (((elem.offset().left - mouse_x)*1.5)/2) - (shadow_width/2);
            $('.intro_screen_ir_shadow').css('left',shadow_x + 'px');

            $log.info(icon_y +','+ shadow_distor);

        };
        $scope.close_intro = function () {
            $('.intro_screen').animate({'opacity': '0'},function(){
                $('.intro_screen').css('display','none');
            });
        };

        $scope.submitLogin = function () {
            var actval = irodsAccount($scope.login.host, $scope.login.port, $scope.login.zone, $scope.login.userName, $scope.login.password, $scope.login.authType, "");
            
            $log.info("irodsAccount for host:" + actval);
            $http({
                method: 'POST',
                url: $globals.backendUrl('login'),
                data: actval,
                headers: { 'Content-Type': 'application/json' }  // set the headers so angular passing info as request payload
            }).then(function (data) {
                    $log.info("login successful" + data);
                    // userService.setLoggedInIdentity(data);

                    var path = $globals.getLastPath();
                    return $q.when(path);

                }).then(function(path) {

                    if (!path) {
                        $log.info("hard code to go home");
                       path="/home/home";
                    } else {
                        // setpath
                        $log.info("setting location to last path:" + path);
                    }

                    $timeout(function () {
                        $location.path(path);
                    });

                    $log.info("end login success processing");

                });
        };

}]);