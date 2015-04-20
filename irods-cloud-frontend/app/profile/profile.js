'use strict';

angular.module('myApp.profile', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/profile/:vpath', {
            templateUrl: 'profile/profile.html',
            controller: 'profileCtrl',
            resolve: {
            }
        }).when('/profile', {
      templateUrl: 'profile/profile.html',
      controller: 'profileCtrl',
      resolve: {
          // set vc name as selected
          selectedVc: function ($route) {

              return null;
          },
          // do a listing
          pagingAwareCollectionListing: function ($route, collectionsService) {
              return {};
          }

      }
  });
}])

    .controller('profileCtrl', ['$scope','$log', '$http', '$location', 'MessageService','globals','breadcrumbsService','virtualCollectionsService','collectionsService','fileService','selectedVc','pagingAwareCollectionListing',function ($scope, $log, $http, $location, MessageService, $globals, breadcrumbsService, $virtualCollectionsService, $collectionsService, fileService, selectedVc, pagingAwareCollectionListing) {

        /*
        basic scope data for collections and views
         */

        /*
        Retrieve the data profile for the data object at the given absolute path
         */
        $scope.retrieveDataProfile = function(irodsAbsolutePath) {
            $log.info("retrieveDataProfile()");
            if (!irodsAbsolutePath) {
                $log.error("missing irodsAbsolutePath")
                MessageService.danger("missing irodsAbsolutePath");
                $scope.dataProfile = {};
            }

            $scope.dataProfile = fileService.retrieveDataProfile(irodsAbsolutePath);

        }

        $scope.retrieveDataProfile();

      
}]);
   