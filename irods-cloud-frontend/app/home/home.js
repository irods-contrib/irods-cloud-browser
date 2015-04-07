'use strict';

angular.module('myApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'home/home.html',
    controller: 'homeCtrl'
  });
}])

    .controller('homeCtrl', ['$scope','$log', '$http', '$location', 'MessageService',function ($scope, $log, $http, $location, MessageService) {

        /**
         * List all virtual collections for the user
         */
        $scope.listVirtualCollections = function () {

            $log.info("getting virtual colls");
            return $http({method: 'GET', url: 'http://localhost:8080/irods-cloud-backend/virtualCollection'}).success(function (data) {
                $scope.virtualCollections = data;
            }).error(function () {
                $scope.virtualCollections = [];
            });

        };

        /**
         * INIT
         */

        $scope.listVirtualCollections();

}]);