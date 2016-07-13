'use strict';

angular.module('myApp.dashboard', ['ngRoute', 'ngFileUpload', 'ng-context-menu','ui.codemirror'])

     .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/dashboard/:vcName', {
            templateUrl: 'dashboard/dashboard.html',
            controller: 'dashboardCtrl',
            resolve: {

                // set vc name as selected
                selectedVc: function ($route, virtualCollectionsService) {

                    var vcData = virtualCollectionsService.listUserVirtualCollectionData($route.current.params.vcName);
                    return vcData;
                },
                // do a listing
                pagingAwareCollectionListing: function ($route, collectionsService) {
                    var vcName = $route.current.params.vcName;

                    var path = $route.current.params.path;
                    if (path == null) {
                        path = "";
                    }

                    return collectionsService.listCollectionContents(vcName, path, 0);
                }

            }
        }).when('/dashboard', {
            templateUrl: 'dashboard/dashboard.html',
            controller: 'dashboardCtrl',
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

    .directive('onLastRepeat', function () {
        return function (scope, element, attrs) {
            if (scope.$last) setTimeout(function () {
                scope.$emit('onRepeatLast', element, attrs);
            }, 1);
        };
    })
    .directive('ngDoubleTap', function() {
        return function (scope, element, attrs) {
          var tapping;
          tapping = false;
          element.bind('touchstart', function(e) {
            element.addClass('active');
            tapping = true;
          });

          element.bind('touchmove', function(e) {
            element.removeClass('active');
            tapping = false;
          });

          element.bind('touchend', function(e) {
            element.removeClass('active');            
            if (tapping) {
                if(scope.tapped == "yes"){
                    scope.$apply(attrs['ngDoubleTap'], element);
                }else{
                    scope.tapped = "yes";
                }              
              scope.explode = function(){
                scope.tapped = "no";
              }
              setTimeout(scope.explode,300)
            }
          });

        };
      })
    .controller('dashboardCtrl', ['$scope', 'Upload', '$log', '$http', '$location', 'MessageService', 'globals', 'breadcrumbsService', 'downloadService', 'virtualCollectionsService', 'collectionsService', 'fileService', 'selectedVc', 'pagingAwareCollectionListing', function ($scope, Upload, $log, $http, $location, MessageService, $globals, breadcrumbsService, downloadService, $virtualCollectionsService, $collectionsService, fileService, selectedVc, pagingAwareCollectionListing) {

        /*
         basic scope data for collections and views
         */

        $scope.selectedVc = selectedVc;
        $scope.pagingAwareCollectionListing = pagingAwareCollectionListing.data;        
        $scope.$on('onRepeatLast', function (scope, element, attrs) {
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                
                $(".ui-selectee").on("tap",function(e){
                  var result = $("#select-result").empty();
                  e.preventDefault();

                  if($(e.target).hasClass('ui-selected')){
                      $(e.target).removeClass('ui-selected');
                  }else{
                      $(e.target).addClass('ui-selected');
                  }
                  if ($(".ui-selected").length > 1) {
                            result.append($('.ui-selected').length + " files");                            
                        } else if ($(".ui-selected").length == 1) {
                            var name_of_selection = $('.ui-selected').text();
                            result.append(name_of_selection);
                        } else if ($(".ui-selected").length == 0) {

                        }

                });
            }else{              
                $(".selectable").selectable({
                    stop: function (){ 
                        $('.list_content').removeClass("ui-selected");
                        var result = $("#select-result").empty();
                        // $(".ui-selected", this).each(function () {
                        //     var index = $("#selectable li").index(this);
                        //     if(index == 0 || index == -1 ){
                        //     }else{
                        //         result.append(" #" + ( index + 1 )); 
                        //     }                       
                        // });
                        if ($(".copy_list_item.ui-selected").length > 1) {
                            $('.copy_list_item.ui-selected').not(':first').removeClass('ui-selected');
                        } 
                        if ($("li.ui-selected").length > 1) {
                            result.append($('.ui-selected').length + " files");
                            $(".download_button").fadeIn();
                            $(".download_divider").fadeIn();
                            $(".rename_button").fadeOut();
                            $(".rename_divider").fadeOut();

                            $(".tablet_download_button").fadeIn();
                            $(".tablet_rename_button").fadeOut();
                            $(".empty_selection").fadeOut();
                            
                        } else if ($("li.ui-selected").length == 1) {
                            var name_of_selection = $('.ui-selected').children('.list_content').children('.data_object').text();
                            result.append(name_of_selection);
                            $(".download_button").fadeIn();
                            $(".rename_button").fadeIn();
                            $(".rename_divider").fadeIn();
                            $(".download_divider").fadeIn();

                            $(".tablet_download_button").fadeIn();
                            $(".tablet_rename_button").fadeIn();
                            $(".empty_selection").fadeOut();
                        } else if ($("li.ui-selected").length == 0) {
                            $(".download_button").fadeOut();
                            $(".rename_button").fadeOut();
                            $(".rename_divider").fadeOut();
                            $(".download_divider").fadeOut();

                            $(".tablet_download_button").fadeOut();
                            $(".tablet_rename_button").fadeOut();
                            $(".empty_selection").fadeIn();
                        }


                    }
                });
            }  
  $('.grid').masonry();        
                   
        });
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
                            fields:{collectionParentName: $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath},
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
        /**
         * Handle the selection of a virtual collection from the virtual collection list, by causing a route change and updating the selected virtual collection
         * @param vcName
         */
        $scope.selectVirtualCollection = function (vcName, path) {

            $log.info("selectVirtualCollection()");
            if (!vcName) {
                MessageService.danger("missing vcName");
                return;
            }
            $log.info("list vc contents for vc name:" + vcName);
            $location.path("/dashboard/" + vcName);
            $location.search("path", path);
        };
        /**
         * Get the breadcrumbs from the pagingAwareCollectionListing in the scope.  This updates the path
         * in the global scope breadcrmubsService.  I don't know if that's the best way, but gotta get it somehow.
         * Someday when I'm better at angualar we can do this differently.
         */
        $scope.getBreadcrumbPaths = function () {

            if (!$scope.pagingAwareCollectionListing) {
                return [];
            }

            breadcrumbsService.setCurrentAbsolutePath($scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath);
            return breadcrumbsService.getWholePathComponents();
        };
        // var download_path
        if ($scope.pagingAwareCollectionListing && $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.pathComponents) {

            $scope.current_collection_index = $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.pathComponents.length - 1;
        }

        $scope.delete_action = function (){
            var delete_objects = $('.ui-selected');
            var delete_paths = '';
            delete_objects.each(function () {
                if ($(this).attr('id') != undefined) {
                    delete_paths += 'path='+ $(this).attr('id') +'&';
                };
            });
            delete_paths = delete_paths.substring(0, delete_paths.length - 1);
            $log.info('Deleting:'+delete_paths);
            return $http({
                    method: 'DELETE',
                    url: $globals.backendUrl('file') + '?' + delete_paths 
                }).success(function (data) {
                    alert('Deletion completed');
                    location.reload();
                })
        };

        $scope.rename_action = function (){
            var rename_path = $('.ui-selected').attr('id');
            var new_name = $('#new_renaming_name').val();
            $log.info('Renaming:'+rename_path);
            return $http({
                    method: 'PUT',
                    url: $globals.backendUrl('rename'),
                    params: {path: rename_path, newName: new_name}
                }).success(function (data) {
                    location.reload();
                })
        };

        $scope.create_collection_action = function (){
            var collections_new_name = $('#new_collection_name').val();
            $log.info('Adding:'+collections_new_name);
            return $http({
                    method: 'PUT',
                    url: $globals.backendUrl('file') + '?path='+ $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath +'/'+ collections_new_name
                }).success(function (data) {
                    location.reload();
                })
        };

        $scope.getDownloadLink = function () {
            $('.list_content').removeClass("ui-selected");
            var links = $('.ui-selected');
            $log.info(links);
            var multiple_paths = '';
            if(links.length == 1){
                var path = $('.ui-selected').attr('id');
                window.open($globals.backendUrl('download') + "?path=" + path, '_blank');
            }else{
                links.each(function () {
                    if ($(this).attr('id') != undefined) {
                        var path = $(this).attr('id');
                        multiple_paths += 'path='+path+'&';
                    };
                });
                multiple_paths = multiple_paths.substring(0, multiple_paths.length - 1);
                window.open($globals.backendUrl('download') + "?" + multiple_paths , '_blank');
            }
        };
        $scope.copy_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            $scope.name_of_selection = $('.ui-selected');
            $scope.name_of_selection.each(function() {
                if ($(this).attr('id') != undefined) {
                    if($(this).hasClass("data_true")){
                        $(".copy_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/data_object_icon.png">'+$(this).attr('id')+'</div></li>'); 
                    }else{
                        $(".copy_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/collection_icon.png">'+$(this).attr('id')+'</div></li>');
                    };
                };              
            }); 
            $('.copier').fadeIn(100);
            return $http({
                method: 'GET', 
                url: $globals.backendUrl('virtualCollection')
            }).success(function (data) {
                $scope.copy_vc_list = data;
            }).error(function () {
                alert("Something went wrong while fetching the Virtual Collections");
                $scope.copy_vc_list = [];
            });
            return $http({
                method: 'GET',
                url: $globals.backendUrl('collection/') + selectedVc.data.uniqueName,
                params: {path: "", offset: 0}
            }).success(function (data) {
                $scope.copy_list = data;
            }).error(function () {
                alert("Something went wrong while fetching the contents of the Collection");
                $scope.copy_list = [];
            });
        };
        $scope.copy_list_refresh = function(VC,selectedPath){
            $scope.copyVC = VC;
            return $http({
                method: 'GET',
                url: $globals.backendUrl('collection/') + VC,
                params: {path: selectedPath, offset: 0}
            }).success(function (data) {
                $scope.copy_list = data;
            }).error(function () {
                alert("Something went wrong while fetching the contents of the Collection");
                $scope.copy_list = [];
            });
        };
        $scope.create_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            $('.creater').fadeIn(100);
        };
        $scope.rename_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            $('.renamer').fadeIn(100);
            var name_of_selection = $('.ui-selected').children('.list_content').children('.data_object').text();
            $('.selected_object').append(name_of_selection);
        };
        $scope.upload_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            $('.uploader').fadeIn(100);
        };
        $scope.delete_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            var delete_objects = $('.ui-selected');
            delete_objects.each(function () {
                if ($(this).attr('id') != undefined) {
                    $(".delete_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/data_object_icon.png">'+$(this).attr('id')+'</div></li>');
                };
            });            
            $('.deleter').fadeIn(100);
        };
        $scope.pop_up_close_clear = function () {

            $('.pop_up_window').fadeOut(100, function () {
                $(".upload_container").css('display', 'block');
                $(".upload_container_result").html('<ul></ul>');
                $(".upload_container_result").css('display', 'none');
                $('.uploader').fadeOut(100);
                $('.deleter').fadeOut(100);
                $('.creater').fadeOut(100);
                $('.renamer').fadeOut(100);
                $('.copier').fadeOut(100);
                location.reload();
            });

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

            $location.path("/dashboard/root");
            $location.search("path", breadcrumbsService.buildPathUpToIndex(index));

        };
        var side_nav_toggled = "yes";
        $scope.side_nav_toggle = function () {

            if (side_nav_toggled == "no") {
                side_nav_toggled = "yes";
                $('.side_nav_options').animate({'opacity': '0'});
                $('#side_nav').addClass('collapsed_nav'); 
                $('#side_nav').removeClass('uncollapsed_nav');
                $('#main_contents').addClass('uncollapsed_main_contents');
                $('#main_contents').removeClass('collapsed_main_contents');
            } else if (side_nav_toggled == "yes") {
                side_nav_toggled = "no";

                $('#side_nav').addClass('uncollapsed_nav');
                $('#side_nav').removeClass('collapsed_nav');
                $('#main_contents').addClass('collapsed_main_contents');
                $('#main_contents').removeClass('uncollapsed_main_contents');
                $('.side_nav_options').animate({'opacity': '1'});
            }
        };
        var toggle_on
        $scope.side_nav_autotoggle = function (auto_toggle) {

            if (auto_toggle == 'off') {
                if (side_nav_toggled == "no") {
                    toggle_on = setTimeout($scope.side_nav_toggle, 1000);
                }
            } else if (auto_toggle == 'on') {
                clearTimeout(toggle_on);
            }
        };
        /**
         * INIT
         */

        $scope.listVirtualCollections();


        /*
         Retrieve the data profile for the data object at the given absolute path
         */
        $scope.selectProfile = function (irodsAbsolutePath) {
            $log.info("going to Data Profile");
            if (!irodsAbsolutePath) {
                $log.error("missing irodsAbsolutePath")
                MessageService.danger("missing irodsAbsolutePath");
            }
            //alert("setting location..");
            //$location.search(null);

            $location.url("/profile/");
            $location.search("path", irodsAbsolutePath);

        }

        $scope.selectDashboardView = function () {
            $log.info("going to Dashboard View");            
            $location.url("/dashboard/");
        }
        $scope.selectHierView = function () {
            $log.info("going to Hierarchical View");            
            $location.url("/home/");
        }
        $scope.selectSearchView = function () {
            $log.info("going to Dashboard View");            
            $location.url("/search/");
        }

    }])
;

