'use strict';

angular.module('myApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'home/home.html',
    controller: 'homeCtrl'
  });
}])

    .controller('homeCtrl', ['$scope','$log', '$http', '$location', 'MessageService','globals',function ($scope, $log, $http, $location, MessageService, $globals) {

        
        $scope.listVirtualCollections = function () {

            $log.info("getting virtual colls");
            return $http({method: 'GET', url: $globals.backendUrl('virtualCollection')}).success(function (data) {
                $scope.virtualCollections = data;
            }).error(function () {
                $scope.virtualCollections = [];
            });
        };        
        var side_nav_toggled = "no";
        $scope.side_nav_toggle = function () {            
            if (side_nav_toggled == "no"){
                side_nav_toggled = "yes";
                $('.side_nav_options').animate({'opacity':'0'});
                $('#side_nav').animate({'width':'3%'});
                $('#main_contents').animate({'width':'96.9%'});
                $('.side_nav_toggle_button').text('>>');
            }else if(side_nav_toggled == "yes"){  
                side_nav_toggled = "no";      
                $('#main_contents').animate({'width':'81.9%'});
                $('#side_nav').animate({'width':'18%'});
                $('.side_nav_options').animate({'opacity':'1'});
                $('.side_nav_toggle_button').text('<<');
            }
        };
        /**
         * INIT
         */

        $scope.listVirtualCollections();

}]);
