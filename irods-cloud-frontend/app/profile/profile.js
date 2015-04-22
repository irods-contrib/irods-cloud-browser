'use strict';

angular.module('myApp.profile', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/profile', {
            templateUrl: 'profile/profile.html',
            controller: 'profileCtrl',
            resolve: {
                dataProfile: function ($route, fileService) {

                    var dataProfile = fileService.retrieveDataProfile($route.current.params.path);
                    return dataProfile;
                }

            }
        });
}])

    .controller('profileCtrl', ['$scope','$log', '$http', '$location', 'MessageService','globals','breadcrumbsService','virtualCollectionsService','collectionsService','fileService','dataProfile',function ($scope, $log, $http, $location, MessageService, $globals, breadcrumbsService, $virtualCollectionsService, $collectionsService, fileService, dataProfile) {

       $scope.dataProfile = dataProfile;
        /*
         Get a default list of the virtual collections that apply to the logged in user, for side nav
         */
        
        $scope.listVirtualCollections = function () {

            $log.info("getting virtual colls");

            return $http({method: 'GET', url: $globals.backendUrl('virtualCollection')}).success(function (data) {
                $scope.virtualCollections = data;
            }).error(function () {
                $scope.virtualCollections = [];
            });
        };
       $scope.listVirtualCollections();
       var side_nav_toggled = "yes";
        $scope.side_nav_toggle = function () {
            if (side_nav_toggled == "no") {
                side_nav_toggled = "yes";
                $('.side_nav_options').animate({'opacity': '0'});
                $('#side_nav').animate({'width': '3%'});
                $('#main_contents').animate({'width': '96.9%'});
                $('.side_nav_toggle_button').text('>>');
            } else if (side_nav_toggled == "yes") {
                side_nav_toggled = "no";
                $('#main_contents').animate({'width': '81.9%'});
                $('#side_nav').animate({'width': '18%'});
                $('.side_nav_options').animate({'opacity': '1'});
                $('.side_nav_toggle_button').text('<<');
            }
        };
        var toggle_on
        $scope.side_nav_autotoggle = function (auto_toggle) {

            if ( auto_toggle == 'off' ) {    
              if(side_nav_toggled == "no"){  
                toggle_on = setTimeout($scope.side_nav_toggle, 3500);
              }
            } else if (auto_toggle == 'on' ) {
              clearTimeout(toggle_on);
            }
        };

        $scope.pop_up_test = function(){
          $('.pop_up_window').fadeIn(100,function(){
            $('.pop_up_window').delay( 8000 ).fadeOut(1000);
          });
        };

        $scope.green_action_toggle= function($event){
          var content = $event.currentTarget.parentElement.nextElementSibling;
          var container = $event.currentTarget.parentElement.parentElement;
          $(content).toggle('normal');
          $(container).toggleClass('green_toggle_container_open');
        };

        /**
         *
         */
        $scope.getBreadcrumbPaths = function () {

            if (!$scope.dataProfile) {
                return [];
            }

            breadcrumbsService.setCurrentAbsolutePath($scope.dataProfile.parentPath);
            return breadcrumbsService.getWholePathComponents();
        };
        /**
         * Upon the selection of an element in a breadrumb link, set that as the location of the browser, triggering
         * a view of that collection
         * @param index
         */
        $scope.goToBreadcrumb = function (index) {

            if (!index) {
                $log.error("cannot go to breadcrumb, no index");
                return;
            }

            $location.path("/home/root");
            $location.search("path", breadcrumbsService.buildPathUpToIndex(index));

        };

    }]);
   