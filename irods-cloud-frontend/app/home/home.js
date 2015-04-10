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

        

        $scope.side_nav_toggle = function () {
            $scope.side_nav_display = $('#side_nav').width();
            if ($scope.side_nav_display >= 100){
                $('#side_nav').animate({'width':'3%'},'normal');
                $('#main_contents').animate({'width':'97%'},'normal');
            }else if($scope.side_nav_display < 100){           
                $('#main_contents').animate({'width':'82%'},'normal');
                $('#side_nav').animate({'width':'18%'},'normal');
            }
        };
        /**
         * INIT
         */

        $scope.listVirtualCollections();

}]);
