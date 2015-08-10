'use strict';

angular.module('myApp.home', ['ngRoute', 'ngFileUpload'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/home/:vcName', {
            templateUrl: 'home/home.html',
            controller: 'homeCtrl',
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
        }).when('/home', {
            templateUrl: 'home/home.html',
            controller: 'homeCtrl',
            resolve: {
               // set vc name as selected
                selectedVc: function ($route, virtualCollectionsService) {

                    var vcData = virtualCollectionsService.listUserVirtualCollectionData("My Home");
                    return vcData;
                },
                // do a listing
                pagingAwareCollectionListing: function ($route, collectionsService) {
                    var vcName = "My Home";

                    var path = $route.current.params.path;
                    if (path == null) {
                        path = "";
                    }

                    return collectionsService.listCollectionContents(vcName, path, 0);
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
    .controller('homeCtrl', ['$scope', 'Upload', '$log', '$http', '$location', 'MessageService', 'globals', 'breadcrumbsService', 'downloadService', 'virtualCollectionsService', 'collectionsService', 'fileService','metadataService','selectedVc', 'pagingAwareCollectionListing', function ($scope, Upload, $log, $http, $location, MessageService, $globals, breadcrumbsService, downloadService, $virtualCollectionsService, $collectionsService, fileService, metadataService,selectedVc, pagingAwareCollectionListing) {

        /*
         basic scope data for collections and views
         */

        $scope.selectedVc = selectedVc;
        $scope.pagingAwareCollectionListing = pagingAwareCollectionListing.data;        
        $scope.$on('onRepeatLast', function (scope, element, attrs) {
                           
                $(".selectable").selectable({
                    stop: function (){ 
                        $('.list_content').removeClass("ui-selected");
                        $('span').removeClass("ui-selected");
                        $('img').removeClass("ui-selected");
                        var result = $("#select-result").empty();
                        var copy_path_display = $("#copy_select_result").empty();
                        var move_path_display = $("#move_select_result").empty();
                        // $(".ui-selected", this).each(function () {
                        //     var index = $("#selectable li").index(this);
                        //     if(index == 0 || index == -1 ){
                        //     }else{
                        //         result.append(" #" + ( index + 1 )); 
                        //     }                       
                        // });
                        if ($(".copy_list_item.ui-selected").length == 1) {
                            var copy_path = $('.copy_list_item.ui-selected').children('.list_content').children('.collection_object').text();
                            copy_path_display.append(copy_path);
                            $scope.copy_target = $('.copy_list_item.ui-selected').attr('id');
                        } 
                        if ($(".copy_list_item.ui-selected").length > 1) {
                            $('.copy_list_item.ui-selected').not(':first').removeClass('ui-selected');
                            var copy_path =  $('.copy_list_item.ui-selected').children('.list_content').children('.collection_object').text();
                            copy_path_display.append(copy_path);
                            $scope.copy_target = $('.copy_list_item.ui-selected').attr('id');
                        } 


                        if ($(".move_list_item.ui-selected").length == 1) {
                            var move_path = $('.move_list_item.ui-selected').children('.list_content').children('.collection_object').text();
                            move_path_display.append(move_path);
                            $scope.move_target = $('.move_list_item.ui-selected').attr('id');
                        } 
                        if ($(".move_list_item.ui-selected").length > 1) {
                            $('.move_list_item.ui-selected').not(':first').removeClass('ui-selected');
                            var move_path = $('.move_list_item.ui-selected').children('.list_content').children('.collection_object').text();
                            move_path_display.append(move_path);
                            $scope.move_target = $('.move_list_item.ui-selected').attr('id');
                        } 


                        if ($("li.ui-selected").length > 1) {
                            result.append("You've selected: " + $('.ui-selected').length + " files");
                            $(".download_button").animate({'opacity' : '0.8'});
                            $(".download_button").css('pointer-events','auto');
                            $(".rename_button").animate({'opacity' : '0.1'});
                            $(".rename_button").css('pointer-events','none');
                            $(".rename_divider").animate({'opacity' : '0.8'});
                            $(".download_divider").animate({'opacity' : '0.8'});

                            $(".tablet_download_button").fadeIn();
                            $(".tablet_rename_button").fadeOut();
                            $(".empty_selection").fadeOut();
                            
                        } else if ($("li.ui-selected").length == 1) {
                            var name_of_selection = "You've selected: " + $('.ui-selected').children('.list_content').children('.data_object').text();
                            if (name_of_selection == "You've selected: "){
                                var name_of_selection = "You've selected: " + $('.ui-selected').children('.list_content').children('.collection_object').text();
                            }

                            result.append(name_of_selection);
                            $(".download_button").animate({'opacity' : '0.8'});
                            $(".download_button").css('pointer-events','auto');
                            $(".rename_button").animate({'opacity' : '0.8'});
                            $(".rename_button").css('pointer-events','auto');
                            $(".rename_divider").animate({'opacity' : '0.8'});
                            $(".download_divider").animate({'opacity' : '0.8'});

                            $(".tablet_download_button").fadeIn();
                            $(".tablet_rename_button").fadeIn();
                            $(".empty_selection").fadeOut();
                        } else if ($("li.ui-selected").length == 0) {
                            $(".download_button").animate({'opacity' : '0.1'});
                            $(".download_button").css('pointer-events','none');
                            $(".rename_button").animate({'opacity' : '0.1'});
                            $(".rename_button").css('pointer-events','none');
                            $(".rename_divider").animate({'opacity' : '0.1'});
                            $(".download_divider").animate({'opacity' : '0.1'});

                            $(".tablet_download_button").fadeOut();
                            $(".tablet_rename_button").fadeOut();
                            $(".empty_selection").fadeIn();
                        }


                    }
                });   
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
            $location.path("/home/" + vcName);
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
                    MessageService.success("Deletion completed!");
                    location.reload();
                })
        };
        $scope.copy_source = "";
        $scope.copy_target = "";

        $scope.copy_action = function (){
            $scope.copy_source = $('.general_list_item .ui-selected').attr('id');        
            $scope.copy_target = $('.copy_list_item.ui-selected').attr('id');
            $log.info('||||||||||||| copying:'+ $scope.copy_source +' to '+ $scope.copy_target);
            return $http({
                    method: 'POST',
                    url: $globals.backendUrl('copy'),
                    params: {sourcePath: $scope.copy_source, targetPath: $scope.copy_target, resource:'', overwrite: 'false' }
                }).success(function () {
                    location.reload();
                })
        };   

        $scope.move_action = function (){
            $scope.copy_source = $('.general_list_item .ui-selected').attr('id');        
            $scope.copy_target = $('.move_list_item.ui-selected').attr('id');
            $log.info('||||||||||||| moving:'+ $scope.copy_source +' to '+ $scope.copy_target);
            return $http({
                    method: 'POST',
                    url: $globals.backendUrl('move'),
                    params: {sourcePath: $scope.copy_source, targetPath: $scope.copy_target, resource:'', overwrite: 'false' }
                }).success(function () {
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

        $scope.move_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            $scope.name_of_selection = $('.ui-selected');
            $scope.name_of_selection.each(function() {
                if ($(this).attr('id') != undefined) {
                    if($(this).hasClass("data_true")){
                        $(".move_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/data_object_icon.png">'+$(this).attr('id')+'</div></li>'); 
                    }else{
                        $(".move_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/collection_icon.png">'+$(this).attr('id')+'</div></li>');
                    };
                };              
            }); 
            $('.mover').fadeIn(100);
            $('.mover_button').fadeIn(100);
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
            $('.copier_button').fadeIn(100);
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
                $("#copy_select_result").empty();
                $("#move_select_result").empty();
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
        $scope.pop_up_close = function () {

            $('.pop_up_window').fadeOut(100, function () {
                $(".upload_container").css('display', 'block');
                $(".upload_container_result").html('<ul></ul>');
                $(".upload_container_result").css('display', 'none');
                $('.uploader').fadeOut(100);
                $('.deleter').fadeOut(100);
                $('.creater').fadeOut(100);
                $('.renamer').fadeOut(100);
                $('.copier').fadeOut(100);
                $('.mover').fadeOut(100);
                $('.copier_button').fadeOut(100);
                $('.mover_button').fadeOut(100);
                location.reload();
            });

        };   
        $scope.logout_func = function (){
            var promise = $http({
                method: 'DELETE',
                url: $globals.backendUrl('login')
            }).then(function (response) {
                // The then function here is an opportunity to modify the response
                // The return value gets picked up by the then in the controller.

                return response.data;
            });
            // Return the promise to the controller
            $location.path("/login");
            return promise;
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
        $scope.green_action_toggle= function($event){
          var content = $event.currentTarget.nextElementSibling;
          var container = $event.currentTarget.parentElement;
          $(content).toggle('normal');
          $(container).toggleClass('green_toggle_container_open');
        };
        var side_nav_toggled = "yes";
        $scope.side_nav_toggle = function () {

            if (side_nav_toggled == "no") {
                side_nav_toggled = "yes";
                $('.side_nav_options').animate({'opacity': '0'});
                $('#side_nav').removeClass('uncollapsed_nav');
                $('#side_nav').addClass('collapsed_nav');
                $('#main_contents').removeClass('uncollapsed_main_content');
                $('#main_contents').addClass('collapsed_main_content');
                $('.side_nav_toggle_button').text('>>');
            } else if (side_nav_toggled == "yes") {
                side_nav_toggled = "no";
                $('#side_nav').removeClass('collapsed_nav');
                $('#side_nav').addClass('uncollapsed_nav');
                $('#main_contents').removeClass('collapsed_main_content');
                $('#main_contents').addClass('uncollapsed_main_content');
                $('.side_nav_options').animate({'opacity': '1'});
                $('.side_nav_toggle_button').text('<<');
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

        $scope.selectGalleryView = function () {
            $log.info("going to Gallery View");            
            $location.url("/gallery/");
        }
        $scope.selectHierView = function () {
            $log.info("going to Hierarchical View");            
            $location.url("/home/home");
        }


    }])
    .factory('virtualCollectionsService', ['$http', '$log', 'globals', function ($http, $log, globals) {
        var virtualCollections = [];
        var virtualCollectionContents = [];
        var selectedVirtualCollection = {};

        return {


            listUserVirtualCollections: function () {
                $log.info("getting virtual colls");
                return $http({method: 'GET', url: globals.backendUrl('virtualCollection')}).success(function (data) {
                    virtualCollections = data;
                }).error(function () {
                    virtualCollections = [];
                });
            },

            listUserVirtualCollectionData: function (vcName) {
                $log.info("listing virtual collection data");

                if (!vcName) {
                    virtualCollectionContents = [];
                    return;
                }

                return $http({
                    method: 'GET',
                    url: globals.backendUrl('virtualCollection/') + vcName
                }).success(function (data) {
                    virtualCollections = data;
                }).error(function () {
                    virtualCollections = [];
                });

            }

        };


    }])
    .factory('downloadService', ['$http', '$log', 'globals', function ($http, $log, $globals) {

        return {

            downloadSingle: function (path) {

                $log.info("dowloading single");
                if (!path) {
                    $log.error("no path provided");
                    throw "no path provided";
                }
                var params = {"path":path};
                window.open($globals.backendUrl('download') + "?path=" + path, '_blank');
            },
            downloadBundle: function (pathArray) {
                $log.info("dowloading bundle");
                if (!path) {
                    $log.error("no path provided");
                    throw "no path provided";
                }

                window.open($globals.backendUrl('download') + "?path=" + path, '_blank');
            }
        };

    }])
    .factory('collectionsService', ['$http', '$log', 'globals', function ($http, $log, $globals) {

        var pagingAwareCollectionListing = {};

        return {

            selectVirtualCollection: function (vcName) {
                //alert(vcName);
            },

            /**
             * List the contents of a collection, based on the type of virtual collection, and any subpath
             * @param reqVcName
             * @param reqParentPath
             * @param reqOffset
             * @returns {*|Error}
             */
            listCollectionContents: function (reqVcName, reqParentPath, reqOffset) {
                $log.info("doing get of the contents of a virtual collection");

                if (!reqVcName) {
                    $log.error("recVcName is missing");
                    throw "reqMcName is missing";
                }

                if (!reqParentPath) {
                    reqParentPath = "";
                }

                if (!reqOffset) {
                    reqOffset = 0;
                }

                $log.info("requesting vc:" + reqVcName + " and path:" + reqParentPath);
                return $http({
                    method: 'GET',
                    url: $globals.backendUrl('collection/') + reqVcName,
                    params: {path: reqParentPath, offset: reqOffset}
                }).success(function (response) {
                    pagingAwareCollectionListing = response.data;

                }).error(function () {
                    pagingAwareCollectionListing = {};

                });

            },
            addNewCollection: function (parentPath, childName) {
                $log.info("addNewCollection()");
            }


        };


    }])
;

