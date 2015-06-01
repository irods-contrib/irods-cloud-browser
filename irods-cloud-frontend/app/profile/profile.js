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

    .controller('profileCtrl', ['$scope','$log', 'Upload', '$http', '$location', 'MessageService','globals','breadcrumbsService','virtualCollectionsService','collectionsService','fileService','dataProfile',function ($scope, $log, Upload, $http, $location, MessageService, $globals, breadcrumbsService, $virtualCollectionsService, $collectionsService, fileService, dataProfile) {

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
                toggle_on = setTimeout($scope.side_nav_toggle, 1000);
              }
            } else if (auto_toggle == 'on' ) {
              clearTimeout(toggle_on);
            }
        };

        
        $scope.$watch('files', function () {
                $scope.upload($scope.files);
            });
        $scope.multiple = true;
        $scope.upload = function (files) {
                if (files && files.length) {
                    $(".upload_container").css('display','none');
                    $(".upload_container_result").css('display','block');

                    for (var i = 0; i < files.length; i++) {                                                                
                        var file = files[i];
                        
                            $(".upload_container_result ul").append('<li id="uploading_item_'+i+'" class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/data_object_icon.png">'+file.name+'</div></li>');
                                                 
                        Upload.upload({
                            url: $globals.backendUrl('file') ,
                            fields:{collectionParentName: $scope.dataProfile.parentPath + "/" +$scope.dataProfile.childName},
                            file: file
                        }).progress(function (evt) {                            
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            $log.info(progressPercentage);                           
                }).success(function (data, status, headers, config) {
                            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                        });
                    }
                }
            };
            $scope.delete_action = function (){
                var delete_paths = 'path='+ $scope.dataProfile.parentPath + "/" +$scope.dataProfile.childName;
                $log.info('Deleting:'+delete_paths);
                return $http({
                        method: 'DELETE',
                        url: $globals.backendUrl('file') + '?' + delete_paths 
                    }).success(function (data) {
                        alert('Deletion completed');
                        window.history.back();
                    })
            };
        $scope.upload_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            $('.uploader').fadeIn(100);
        };
        $scope.delete_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);            
                
                    $(".delete_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/data_object_icon.png">'+$scope.dataProfile.childName+'</div></li>');
                         
            $('.deleter').fadeIn(100);
        };
        $scope.pop_up_close = function () {

            $('.pop_up_window').fadeOut(100, function () {
                $(".upload_container").css('display', 'block');
                $(".upload_container_result").html('<ul></ul>');
                $(".upload_container_result").css('display', 'none');
                $('.uploader').fadeOut(100);
                $('.deleter').fadeOut(100);
                location.reload();
            });

        };
        $scope.green_action_toggle= function($event){
          var content = $event.currentTarget.nextElementSibling;
          var container = $event.currentTarget.parentElement;
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

        $scope.getDownloadLink = function() {
            return  $globals.backendUrl('download') + "?path=" + $scope.dataProfile.domainObject.absolutePath;

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
   