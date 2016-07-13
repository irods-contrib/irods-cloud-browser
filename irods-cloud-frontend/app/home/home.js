'use strict';

angular.module('myApp.home', ['ngRoute', 'ngFileUpload', 'ng-context-menu','ui.codemirror'])

    .config(['$routeProvider', function ($routeProvider, globals) {
        $routeProvider.when('/home/:vcName', {
            templateUrl: 'home/home.html',
            controller: 'homeCtrl',
            resolve: {

                // set vc name as selected
                selectedVc: function ($route, virtualCollectionsService, globals) {

                        var vcData = virtualCollectionsService.listUserVirtualCollectionData($route.current.params.vcName);
                        return vcData;

                },
                // do a listing
                pagingAwareCollectionListing: function ($route, collectionsService, globals) {

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
                    var current_vc = "My Home";
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

        // var elm1 = document.getElementById('body');
        // var timeout;
        // var lastTap = 0;
        // elm1.addEventListener('touchend', function(event) {
        //     event.preventDefault();
        //     var currentTime = new Date().getTime();
        //     var tapLength = currentTime - lastTap;
        //     clearTimeout(timeout);
        //     if (tapLength < 500 && tapLength > 0) {                
        //         if($(event.target).parents("li").hasClass("data_true")){
        //             var path = $(event.target).parents("li").attr("id");
        //             $scope.selectProfile(path,true);
        //         }else if ($(event.target).parents("li").hasClass("data_false")){
        //             var path = $(event.target).parents("li").attr("id");
        //             $scope.selectVirtualCollection($scope.selectedVc.data.uniqueName,path,true)
        //         };
        //     } else {
        //         timeout = setTimeout(function() {
        //             if($(event.target).parents("li").hasClass("ui-widget-content")){

        //             }
        //             clearTimeout(timeout);
        //         }, 500);
        //     }
        //     lastTap = currentTime;
        // });


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
    .filter('iconic', function () {
        return function (input, optional) {
            var out = "";
            if (input == "virtual.collection.default.icon") {
                var out = "folder";
            } else if (input == "virtual.collection.icon.starred") {
                var out = "star";
            } else if (input == "Text File") {
                var out = "file-text-o";
            } else if (input == "XML File") {
                var out = "file-o";
            } else if (input == "iRODS Rule") {
                var out = "file-code-o";
            }
            return out;
        };
    })
    .controller('homeCtrl', ['$scope', 'Upload', '$log', '$http', '$location', 'MessageService', 'globals', 'breadcrumbsService', 'downloadService', 'virtualCollectionsService', 'collectionsService', 'fileService', 'metadataService', 'selectedVc', 'pagingAwareCollectionListing', function ($scope, Upload, $log, $http, $location, MessageService, $globals, breadcrumbsService, downloadService, $virtualCollectionsService, $collectionsService, fileService, metadataService, selectedVc, pagingAwareCollectionListing) {

        /*
         basic scope data for collections and views
         */
         $scope.editorOptions = {
            lineWrapping : false,
            lineNumbers: true,
            mode: {name:"javascript", typescript: true}
        };
        $scope.pop_up_form = "";
        $scope.list_file_templates = function () {

                $log.info("getting file templates");
                return $http({method: 'GET', url: $globals.backendUrl('fileCreatorTemplate')}).success(function (data) {
                    $scope.file_templates = data;
                }).error(function () {
                    $scope.file_templates = [];
                });
            

        };
        $scope.list_file_templates();
        $scope.selectedVc = selectedVc;
        $scope.pagingAwareCollectionListing = pagingAwareCollectionListing;
        $scope.selected_target = "";
        $scope.$on('onRepeatLast', function (scope, element, attrs) {            
            $(".selectable").selectable({
                stop: function () {
                    $('.list_content').removeClass("ui-selected");
                    $('span').removeClass("ui-selected");
                    $('img').removeClass("ui-selected");
                    var result = $("#select-result").empty();
                    $(".dropdown").removeClass("open");
                    var copy_path_display = $(".copy_select_result").empty();
                    
                    if ($(".copy_list_item.ui-selected").length == 1) {
                        var copy_path = $('.copy_list_item.ui-selected').children('.list_content').children('.collection_object').text();
                        copy_path_display.append(copy_path);
                        $scope.copy_target = $('.copy_list_item.ui-selected').attr('id');
                    }
                    if ($(".copy_list_item.ui-selected").length > 1) {
                        $('.copy_list_item.ui-selected').not(':first').removeClass('ui-selected');
                        var copy_path = $('.copy_list_item.ui-selected').children('.list_content').children('.collection_object').text();
                        copy_path_display.append(copy_path);
                        $scope.copy_target = $('.copy_list_item.ui-selected').attr('id');
                    }

                    if ($(".move_list_item.ui-selected").length == 1) {
                        var move_path = $('.move_list_item.ui-selected').children('.list_content').children('.collection_object').text();
                        copy_path_display.append(move_path);
                        $scope.copy_target = $('.move_list_item.ui-selected').attr('id');
                    }
                    if ($(".move_list_item.ui-selected").length > 1) {
                        $('.move_list_item.ui-selected').not(':first').removeClass('ui-selected');
                        var move_path = $('.move_list_item.ui-selected').children('.list_content').children('.collection_object').text();
                        copy_path_display.append(move_path);
                        $scope.move_target = $('.move_list_item.ui-selected').attr('id');
                    }


                    if ($(".general_list_item .ui-selected").length > 1) {
                        result.append("You've selected: " + $('.general_list_item .ui-selected').length + " items");
                        $(".download_button").css('opacity', '1');
                        $(".download_button").css('pointer-events', 'auto');
                        $(".rename_button").css('opacity', '0.1');
                        $(".rename_button").css('pointer-events', 'none');
                        $(".rename_divider").css('opacity', '1');
                        $(".download_divider").css('opacity', '1');

                        $(".tablet_download_button").fadeIn();
                        $(".tablet_rename_button").fadeOut();
                        $(".empty_selection").fadeOut();

                    } else if ($(".general_list_item .ui-selected").length == 1) {
                        $scope.selected_target = $('.general_list_item .ui-selected').attr("id");
                        var name_of_selection = "You've selected: " + $('.ui-selected').children('.list_content').children('.data_object').text();
                        if (name_of_selection == "You've selected: ") {
                            var name_of_selection = "You've selected: " + $('.ui-selected').children('.list_content').children('.collection_object').text();
                        }

                        result.append(name_of_selection);
                        $(".download_button").css('opacity', '1');
                        $(".download_button").css('pointer-events', 'auto');
                        $(".file_edit_button").css('opacity', '0.1');
                        $(".file_edit_button").css('pointer-events', 'none');
                        $(".folder_upload_button").css('opacity', '1');
                        $(".folder_upload_button").css('pointer-events', 'auto');
                        $(".rename_button").css('opacity', '1');
                        $(".rename_button").css('pointer-events', 'auto');
                        $(".rename_divider").css('opacity', '1');
                        $(".download_divider").css('opacity', '1');
                        $(".tablet_download_button").fadeIn();
                        $(".tablet_rename_button").fadeIn();
                        $(".empty_selection").fadeOut();
                        if($(".general_list_item .ui-selected").hasClass("data_true")){
                            $(".file_edit_button").css('opacity', '1');
                            $(".file_edit_button").css('pointer-events', 'auto');
                            $(".folder_upload_button").css('opacity', '0.1');
                            $(".folder_upload_button").css('pointer-events', 'none');
                        };
                    } else if ($(".general_list_item .ui-selected").length == 0) {
                        $(".download_button").css('opacity', '0.1');
                        $(".download_button").css('pointer-events', 'none');
                        $(".rename_button").css('opacity', '0.1');
                        $(".rename_button").css('pointer-events', 'none');
                        $(".rename_divider").css('opacity', '0.1');
                        $(".download_divider").css('opacity', '0.1');
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
        $scope.current_page = 'browsing';
        $scope.files_to_upload = [];
        $scope.files_name = [];
        $scope.copy_source = "";
        $scope.copy_target = "";       
        $scope.stage_files = function (files) {
            if (files && files.length) {
                $(".upload_container").css('display', 'none');
                $(".upload_container_result").css('display', 'block');

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var pre_existing = $.inArray(file.name, $scope.files_name);
                    if (pre_existing === 0) {
                        MessageService.danger('There is already a file named "' + file.name + '" on your list');
                    } else {
                        $scope.files_to_upload.push(file);
                        $scope.files_name.push(file.name);
                        $(".upload_container_result ul").append('<li id="uploading_item_' + i + '" class="light_back_option_even"><div class="col-xs-10 list_content"><i class="fa fa-file-o"></i>&nbsp' + file.name + '</div></li>');
                    }
                }
            }

        }
        $scope.upload = function (upload_path) {

            if ($scope.files_to_upload && $scope.files_to_upload.length) {
                for (var i = 0; i < $scope.files_to_upload.length; i++) {
                    var file = $scope.files_to_upload[i];
                    Upload.upload({
                        url: $globals.backendUrl('file'),
                        fields: {collectionParentName: upload_path},
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $log.info(progressPercentage);
                    }).then(function (data) {
                        return $collectionsService.listCollectionContents($scope.selectedVc.data.uniqueName, $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath, 0);
                    }).then(function (data) {
                        MessageService.success("Upload completed!");
                        $scope.pagingAwareCollectionListing = data;
                        $scope.pop_up_close_clear();
                        $scope.files_to_upload = [];
                        $scope.files_name = [];
                    });
                }
            }
        };
        /*
         Get a default list of the virtual collections that apply to the logged in user, for side nav
         */

        $scope.listVirtualCollections = function () {

            /* TODO: this should be in the resolver, not automatic the guard prevents extra error messages on failed login- MCC*/
            /*if ($globals.loggedInIdentity != null) {*/

                $log.info("getting virtual colls");
                return $http({method: 'GET', url: $globals.backendUrl('virtualCollection')}).success(function (data) {
                    $scope.virtualCollections = data;
                }).error(function () {
                    $scope.virtualCollections = [];
                });
            /*}*/

        };

        /**
         * Handle the selection of a virtual collection from the virtual collection list, by causing a route change and updating the selected virtual collection
         * @param vcName
         */
        $scope.selectVirtualCollection = function (vcName, path, touch_event) {
            $log.info("selectVirtualCollection()");
            if (!vcName) {
                MessageService.danger("missing vcName");
                return;
            }
            $log.info("list vc contents for vc name:" + vcName);
            $location.path("/home/" + vcName);
            $location.search("path", path);
            if(touch_event == true){
                $scope.$apply();
            };

        };
        /**
         * Get the breadcrumbs from the pagingAwareCollectionListing in the scope.  This updates the path
         * in the global scope breadcrmubsService.  I don't know if that's the best way, but gotta get it somehow.
         * Someday when I'm better at angualar we can do this differently.
         */
        $scope.getBreadcrumbPaths = function () {

            breadcrumbsService.setCurrentAbsolutePath($scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath);
            $scope.breadcrumb_full_array = breadcrumbsService.getWholePathComponents();
            $scope.breadcrumb_full_array_paths = [];
            var totalPath = "";
            for (var i = 0; i < $scope.breadcrumb_full_array.length; i++) {
                totalPath = totalPath + "/" + $scope.breadcrumb_full_array[i];
                $scope.breadcrumb_full_array_paths.push({b: $scope.breadcrumb_full_array[i], path: totalPath});
            }
            if ($scope.breadcrumb_full_array_paths.length > 5) {
                $scope.breadcrumb_compressed_array = $scope.breadcrumb_full_array_paths.splice(0, ($scope.breadcrumb_full_array_paths.length) - 5);
            }
        };
        // var download_path
        if ($scope.pagingAwareCollectionListing && $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.pathComponents) {

            $scope.current_collection_index = $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.pathComponents.length - 1;
        }

        /**
         * Upon the selection of an element in a breadrumb link, set that as the location of the browser, triggering
         * a view of that collection
         * @param index
         */
        $scope.goToBreadcrumb = function (path) {

            if (!path) {
                $log.error("cannot go to breadcrumb, no path");
                return;
            }
            $location.path("/home/root");
            $location.search("path", path);

        };
        $scope.delete_action = function () {
            var delete_objects = $('.ui-selected');
            var delete_paths = [];
            delete_objects.each(function () {
                if ($(this).attr('id') != undefined) {
                    delete_paths.push($(this).attr('id'));
                }
                ;
            });
            //delete_paths = delete_paths.substring(0, delete_paths.length - 1);
            $log.info('Deleting:' + delete_paths);
            return $http({
                method: 'DELETE',
                url: $globals.backendUrl('file'),
                params: {
                    path: delete_paths
                }
            }).then(function (data) {
                return $collectionsService.listCollectionContents($scope.selectedVc.data.uniqueName, $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath, 0);
            }).then(function (data) {
                MessageService.info("Deletion completed!");
                $scope.pagingAwareCollectionListing = data;
                $scope.listVirtualCollections();
                $scope.pop_up_close_clear();
            })
        };
        
        $scope.query_delete_action = function () {
            $log.info('Deleting:' + $scope.right_clicked_query);
            $log.info('ID:' + $scope.right_clicked_query_id);
            return $http({
                method: 'DELETE',
                url: $globals.backendUrl('virtualCollection' + "/" + encodeURI($scope.right_clicked_query_id)),
                params: {

                }
            }).then(function (data) {
                MessageService.info("Deletion completed!");
                $location.path("/home/My Home");
            })
        };

        $scope.move_query_to_my_folders = function () {
            $log.info('Moving:' + $scope.right_clicked_query);
            $log.info('ID:' + $scope.right_clicked_query_id);
            return $http({
                method: 'POST',
                url: $globals.backendUrl('virtualCollection' + "/" + encodeURI($scope.right_clicked_query_id)),
                params: {
                    collType: 'USER_HOME'
                }
            }).then(function (data) {
                return $scope.listVirtualCollections();
            }).then(function (data) {
                MessageService.success("Move completed!");
            })
        };

        $scope.copy_action = function () {            
            $log.info('||||||||||||| copying:' + $scope.copy_source + ' to ' + $scope.copy_target);
            return $http({
                method: 'POST',
                url: $globals.backendUrl('copy'),
                params: {
                    sourcePath: $scope.copy_source,
                    targetPath: $scope.copy_target,
                    resource: '',
                    overwrite: 'false'
                }
            }).then(function (data) {
                return $collectionsService.listCollectionContents($scope.selectedVc.data.uniqueName, $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath, 0);
            }).then(function (data) {
                MessageService.success("Copy completed!");
                $scope.pagingAwareCollectionListing = data;
                $scope.pop_up_close_clear();
            })
        };


        $scope.move_action = function () {
            $log.info('||||||||||||| moving:' + $scope.copy_source + ' to ' + $scope.copy_target);
            return $http({
                method: 'POST',
                url: $globals.backendUrl('move'),
                params: {
                    sourcePath: $scope.copy_source,
                    targetPath: $scope.copy_target,
                    resource: '',
                    overwrite: 'false'
                }
            }).then(function (data) {
                return $collectionsService.listCollectionContents($scope.selectedVc.data.uniqueName, $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath, 0);
            }).then(function (data) {
                MessageService.success("File Successfully moved");
                $scope.pagingAwareCollectionListing = data;
                $scope.pop_up_close_clear();
            })
        };


        $scope.rename_action = function () {
            var rename_path = $('li.ui-selected').attr('id');
            var new_name = $('#new_renaming_name').val();
            var data_name_unique = 'yes';
            for (var i = 0; i < $scope.pagingAwareCollectionListing.collectionAndDataObjectListingEntries.length; i++) {
                var file = $scope.pagingAwareCollectionListing.collectionAndDataObjectListingEntries[i];
                if (new_name === file.nodeLabelDisplayValue) {
                    MessageService.danger('There is already an item named "' + new_name + '", please choose a different name');
                    data_name_unique = "no";
                    $('#new_renaming_name').addClass('has_error');
                    $('#new_renaming_name').focus();
                }
            }
            if (data_name_unique === "yes") {
                $log.info('Renaming:' + rename_path);
                $http({
                    method: 'PUT',
                    url: $globals.backendUrl('rename'),
                    params: {path: rename_path, newName: new_name}
                }).then(function (data) {
                    return $collectionsService.listCollectionContents($scope.selectedVc.data.uniqueName, $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath, 0);
                }).then(function (data) {
                    MessageService.success("Renaming completed!");
                    $scope.pagingAwareCollectionListing = data;
                    $scope.pop_up_close_clear();
                })
            }
        };

        $scope.create_collection_action = function () {
            var collections_new_name = $('#new_collection_name').val();
            var collections_name_unique = 'yes';
            for (var i = 0; i < $scope.pagingAwareCollectionListing.collectionAndDataObjectListingEntries.length; i++) {
                var file = $scope.pagingAwareCollectionListing.collectionAndDataObjectListingEntries[i];
                if (collections_new_name === file.nodeLabelDisplayValue) {
                    MessageService.danger('There is already a collection named "' + collections_new_name + '", please choose a different name');
                    collections_name_unique = "no";
                    $('#new_collection_name').focus();
                    $('#new_collection_name').addClass('has_error');
                }
            }
            if (collections_name_unique === "yes") {
                $log.info('Adding:' + collections_new_name);
                return $http({
                    method: 'PUT',
                    url: $globals.backendUrl('file') + '?path=' + $globals.sanitizeCollName($scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath + '/' + collections_new_name)
                }).then(function (data) {
                    return $collectionsService.listCollectionContents($scope.selectedVc.data.uniqueName, $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath, 0);
                }).then(function (data) {
                    MessageService.success("Collection Added!");
                    $scope.pagingAwareCollectionListing = data;
                    $scope.pop_up_close_clear();
                })
            }
        };
        $scope.create_file_action = function () {
                var file_name = $('#new_file_name').val();
                $log.info('Adding:' + file_name + $scope.file_to_be_created.templateUniqueIdentifier);
                return $http({
                    method: 'PUT',
                    url: $globals.backendUrl('fileCreatorTemplate'),
                    params: {parentPath:$scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath,fileName:file_name,templateUniqueIdentifier:$scope.file_to_be_created.templateUniqueIdentifier}
                }).success(function (data) {
                    $scope.pop_up_close_clear();
                    $scope.editFile($scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath + '/' +file_name)
                }).error(function (data) {
                    MessageService.danger(data);
                });
            
        };

        $scope.getDownloadLink = function () {
            $('.list_content').removeClass("ui-selected");
            var links = $('.ui-selected');
            $log.info(links);
            var multiple_paths = '';
            if (links.length == 1) {
                var path = $('.ui-selected').attr('id');
                window.open($globals.backendUrl('download') + "?path=" + path, '_blank');
            } else {
                links.each(function () {
                    if ($(this).attr('id') != undefined) {
                        var path = $(this).attr('id');
                        multiple_paths += 'path=' + path + '&';
                    }
                    ;
                });
                multiple_paths = multiple_paths.substring(0, multiple_paths.length - 1);
                window.open($globals.backendUrl('download') + "?" + multiple_paths, '_blank');
            }
        };


        

        $scope.green_action_toggle = function ($event) {
            var content = $event.currentTarget.nextElementSibling;
            var container = $event.currentTarget.parentElement;
            $(content).toggle('normal');
            $(container).toggleClass('green_toggle_container_open');
        };

        
        /****************************************
         ****  POP UP ACTIONS AND FUNCTIONS  ****
         ****************************************/

        $(window).keyup(function($event){   
            if($event.keyCode == "13"){         
                if($scope.pop_up_form == "delete"){
                    $scope.delete_action();
                }
                if($scope.pop_up_form == "upload"){
                    $scope.upload();
                }
                if($scope.pop_up_form == "copy"){
                    $scope.copy_action();
                }
                if($scope.pop_up_form == "move"){
                    $scope.move_action();
                }
                if($scope.pop_up_form == "create"){
                    $scope.create_collection_action();
                }
                if($scope.pop_up_form == "file_create"){
                    $scope.create_file_action();
                }
                if($scope.pop_up_form == "rename"){
                    $scope.rename_action();
                }
            }
        });
        $scope.event_z = "";
        $(window).mousedown(function(event) {
            switch (event.which) {
                case 1:
                    if($(event.target).is("div")){
                        if ($(event.target).parents().hasClass("ui-selectee") || $(event.target).parents().hasClass("selection_actions_container") || $(event.target).parents().hasClass("pop_up_window")) {
                            
                        }else{
                            $(".general_list_item .ui-selected").removeClass("ui-selected");
                            $(".recent_query").removeClass("selected");
                            $(".download_button").css('opacity', '0.1');
                            $(".download_button").css('pointer-events', 'none');
                            $(".rename_button").css('opacity', '0.1');
                            $(".rename_button").css('pointer-events', 'none');
                            $(".rename_divider").css('opacity', '0.1');
                            $(".download_divider").css('opacity', '0.1');
                            $(".tablet_download_button").fadeOut();
                            $(".tablet_rename_button").fadeOut();
                            $(".empty_selection").fadeIn();
                            $("#select-result").empty();
                            $(".dropdown").removeClass("open");                            
                        }
                    }
                    break;
                case 3:
                    $(".dropdown").removeClass("open");
                    if ($(".general_list_item .ui-selected").length == 0 || $(".general_list_item .ui-selected").length == 1) {
                        $(".general_list_item .ui-selected").removeClass("ui-selected");
                        $(event.target).parents("li").addClass("ui-selected","fast",function(){
                            var result = $("#select-result").empty();
                            $scope.selected_target = $('.general_list_item .ui-selected').attr("id");
                            var name_of_selection = "You've selected: " + $('.ui-selected').children('.list_content').children('.data_object').text();
                            if (name_of_selection == "You've selected: ") {
                                var name_of_selection = "You've selected: " + $('.ui-selected').children('.list_content').children('.collection_object').text();
                            }

                            result.append(name_of_selection);
                            $(".download_button").css('opacity','1');
                            $(".download_button").css('pointer-events', 'auto');
                            $(".rename_button").css('opacity','1');
                            $(".rename_button").css('pointer-events', 'auto');
                            $(".rename_divider").css('opacity','1');
                            $(".download_divider").css('opacity','1');
                            $(".tablet_download_button").fadeIn();
                            $(".tablet_rename_button").fadeIn();
                            $(".empty_selection").fadeOut();
                            $(".file_edit_button").css('opacity', '0.1');
                            $(".file_edit_button").css('pointer-events', 'none');
                            $(".folder_upload_button").css('opacity', '1');
                            $(".folder_upload_button").css('pointer-events', 'auto');
                            if($(event.target).parents("li").hasClass("data_true")){
                                $(".file_edit_button").css('opacity', '1');
                                $(".file_edit_button").css('pointer-events', 'auto');
                                $(".folder_upload_button").css('opacity', '0.1');
                                $(".folder_upload_button").css('pointer-events', 'none');
                            };
                        });
                        
                        if($(event.target).parents("li").hasClass('recent_query')){
                            $scope.right_clicked_query = $(event.target).parents("li").children("span").attr("id");   
                            $scope.right_clicked_query_id = $(event.target).parents("li").attr("id");
                        }
                        if($(event.target).parents("li").hasClass('permanent_folder')){
                            $scope.right_clicked_query = $(event.target).parents("li").children("span").attr("id");   
                            $scope.right_clicked_query_id = $(event.target).parents("li").attr("id");
                        }
                    }
                    if ($(".general_list_item .ui-selected").length > 1) {
                        if(!$(event.target).parents("li").hasClass("ui-selected")){
                            $(".general_list_item .ui-selected").removeClass("ui-selected");
                        $(event.target).parents("li").addClass("ui-selected","fast",function(){
                            var result = $("#select-result").empty();
                            $scope.selected_target = $('.general_list_item .ui-selected').attr("id");
                            var name_of_selection = "You've selected: " + $('.ui-selected').children('.list_content').children('.data_object').text();
                            if (name_of_selection == "You've selected: ") {
                                var name_of_selection = "You've selected: " + $('.ui-selected').children('.list_content').children('.collection_object').text();
                            }

                            result.append(name_of_selection);
                            $(".download_button").css('opacity','1');
                            $(".download_button").css('pointer-events', 'auto');
                            $(".rename_button").css('opacity','1');
                            $(".rename_button").css('pointer-events', 'auto');
                            $(".rename_divider").css('opacity','1');
                            $(".download_divider").css('opacity','1');
                            $(".tablet_download_button").fadeIn();
                            $(".tablet_rename_button").fadeIn();
                            $(".empty_selection").fadeOut();
                            $(".file_edit_button").css('opacity', '0.1');
                            $(".file_edit_button").css('pointer-events', 'none');
                            $(".folder_upload_button").css('opacity', '1');
                            $(".folder_upload_button").css('pointer-events', 'auto');
                            if($(event.target).parents("li").hasClass("data_true")){
                                $(".file_edit_button").css('opacity', '1');
                                $(".file_edit_button").css('pointer-events', 'auto');
                                $(".folder_upload_button").css('opacity', '0.1');
                                $(".folder_upload_button").css('pointer-events', 'none');
                            };
                        });
                        }
                    }
                    break;
            }
        });     

        $scope.getCopyBreadcrumbPaths = function () {     
            $scope.breadcrumb_popup_full_array = $scope.copy_list.data.pagingAwareCollectionListingDescriptor.parentAbsolutePath.split("/");
            $scope.breadcrumb_popup_full_array.shift();
            $scope.breadcrumb_popup_full_array_paths = [];
            var popup_totalPath = "";
            for (var i = 0; i < $scope.breadcrumb_popup_full_array.length; i++) {
                popup_totalPath = popup_totalPath + "/" + $scope.breadcrumb_popup_full_array[i];
                $scope.breadcrumb_popup_full_array_paths.push({
                    b: $scope.breadcrumb_popup_full_array[i],
                    path: popup_totalPath
                });
            }
            if ($scope.breadcrumb_popup_full_array.length > 5) {
                $scope.breadcrumb_popup_compressed_array = $scope.breadcrumb_popup_full_array_paths.splice(0, ($scope.breadcrumb_popup_full_array_paths.length) - 5);
            } else {
                $scope.breadcrumb_popup_compressed_array = [];
            }
        }
        $scope.set_path = function (path_name, path) {
            var copy_path_display = $(".copy_select_result").empty();
            var copy_path = path_name;
            copy_path_display.append(copy_path);
            $scope.copy_target = path;
        };
        $scope.copy_list_refresh = function (VC, selectedPath) {
            if (VC == "") {
                var pop_up_vc = $scope.copyVC.data.uniqueName;
            } else {
                var pop_up_vc = VC;
            }
            $http({
                method: 'GET',
                url: $globals.backendUrl('collection/') + pop_up_vc,
                params: {path: selectedPath, offset: 0}
            }).then(function (data) {
                $scope.copy_list = data;
            }).then(function () {
                return $http({
                    method: 'GET',
                    url: $globals.backendUrl('virtualCollection/') + pop_up_vc
                })
            }).then(function (data) {
                $scope.copyVC = data;
                if ($scope.copyVC.data.type == 'COLLECTION') {
                    $scope.getCopyBreadcrumbPaths();
                }
            });

        };

        $scope.move_pop_up_open = function () {     
            $scope.pop_up_form = "move";
            window.scrollTo(0,0);
            $scope.copy_source = $('.general_list_item .ui-selected').attr('id');       
            $scope.copyVC = $scope.selectedVc;
            $('.pop_up_window').fadeIn(100);
            $scope.name_of_selection = $('.ui-selected');
            var copy_path_display = $(".copy_select_result").empty();
            var path_array = $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.pathComponents;
            var current_collection = path_array[path_array.length - 1];
            $scope.copy_source = $('.general_list_item .ui-selected').attr('id');
            $scope.copy_target = $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath;
            copy_path_display.append(current_collection);
            $scope.name_of_selection.each(function () {
                if ($(this).attr('id') != undefined) {
                        $(".move_container ul").append('<li class="light_back_option_even"><div class="col-xs-12 list_content"><i class="fa fa-folder folder_listing"></i>&nbsp' + $(this).attr('id') + '</div></li>');
                };
            });
            $('.mover').fadeIn(100);
            $('.mover_button').fadeIn(100);
            $http({
                method: 'GET',
                url: $globals.backendUrl('virtualCollection')
            }).then(function (data) {
                $scope.copy_vc_list = data;
            }).then(function () {
                return $http({
                    method: 'GET',
                    url: $globals.backendUrl('collection/') + $scope.copyVC.data.uniqueName,
                    params: {
                        path: $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath,
                        offset: 0
                    }
                })
            }).then(function (data) {
                $scope.copy_list = data;
                $scope.getCopyBreadcrumbPaths();
            });
        };

        $scope.copy_pop_up_open = function () {
            $scope.pop_up_form = "copy";  
            window.scrollTo(0,0);
            $scope.copy_source = $('.general_list_item .ui-selected').attr('id');
            $scope.copyVC = $scope.selectedVc;
            $('.pop_up_window').fadeIn(100);
            $scope.name_of_selection = $('.ui-selected');
            var copy_path_display = $(".copy_select_result").empty();
            var path_array = $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.pathComponents;
            var current_collection = path_array[path_array.length - 1];
            $scope.copy_source = $('.general_list_item .ui-selected').attr('id');
            $scope.copy_target = $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath;
            copy_path_display.append(current_collection);
            $scope.name_of_selection.each(function () {
                if ($(this).attr('id') != undefined) {                    
                        $(".copy_container ul").append('<li class="light_back_option_even"><div class="col-xs-12 list_content"><i class="fa fa-folder folder_listing"></i>&nbsp' + $(this).attr('id') + '</div></li>');
                };
            });
            $('.copier').fadeIn(100);
            $('.copier_button').fadeIn(100);
            $http({
                method: 'GET',
                url: $globals.backendUrl('virtualCollection')
            }).then(function (data) {
                $scope.copy_vc_list = data;
            }).then(function () {
                return $http({
                    method: 'GET',
                    url: $globals.backendUrl('collection/') + $scope.copyVC.data.uniqueName,
                    params: {
                        path: $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath,
                        offset: 0
                    }
                })
            }).then(function (data) {
                $scope.copy_list = data;
                $scope.getCopyBreadcrumbPaths();
            });
        };
        $scope.create_pop_up_open = function () {
            $scope.pop_up_form = "create";
            window.scrollTo(0,0);
            $('.pop_up_window').fadeIn(100);
            $('.creater').fadeIn(100);
            $('#new_collection_name').focus();
        };
        $scope.create_file_pop_up_open = function (file) {
            $scope.pop_up_form = "file_create";
            window.scrollTo(0,0);
            $scope.file_to_be_created = file;
            $('.pop_up_window').fadeIn(100);
            $('.file_creater').fadeIn(100);
            $('#new_file_name').focus();
        };
        $scope.rename_pop_up_open = function () {
            if($('li.ui-selected').hasClass("data_true")){
                $scope.renaming_item = "file";
            }else{
                $scope.renaming_item = "folder";
            }
            $scope.pop_up_form = "rename";
            window.scrollTo(0,0);
            $('.pop_up_window').fadeIn(100);
            $('.renamer').fadeIn(100);
            $('#new_renaming_name').focus();
            var name_of_selection = $('li.ui-selected').children('.list_content').children('span').text();
            $('.selected_object').append(name_of_selection);
        };
        $scope.upload_pop_up_open = function () {
            $scope.pop_up_form = "upload";
            if ($(".general_list_item .ui-selected").length == 0){
                $scope.upload_path = $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath;
                $scope.upload_paths_array = $scope.upload_path.split("/"); 
                $scope.upload_folder_name = $scope.upload_paths_array[$scope.upload_paths_array.length-1]
            }else{
                $scope.upload_path = $(".general_list_item .ui-selected").attr("id");
                $scope.upload_paths_array = $scope.upload_path.split("/"); 
                $scope.upload_folder_name = $scope.upload_paths_array[$scope.upload_paths_array.length-1]
            }
            window.scrollTo(0,0);
            $('.pop_up_window').fadeIn(100);
            $('.uploader').fadeIn(100);
        };
        $scope.delete_pop_up_open = function () {
            $scope.pop_up_form = "delete";
            window.scrollTo(0,0);
            $('.pop_up_window').fadeIn(100);     
            var delete_objects = $('.ui-selected');
            delete_objects.each(function () {
                if ($(this).attr('id') != undefined) {
                    if ($(this).hasClass("data_true")) {
                        $(".delete_container ul").append('<li class="light_back_option_even"><div class="col-xs-12 list_content"><i class="fa fa-file-o "></i>&nbsp' + $(this).attr('id') + '</div></li>');
                    } else {
                        $(".delete_container ul").append('<li class="light_back_option_even"><div class="col-xs-12 list_content"><i class="fa fa-folder folder_listing"></i>&nbsp' + $(this).attr('id') + '</div></li>');
                    }
                    ;
                }
                ;
            });
            $('.deleter').fadeIn(100);
        };
        $scope.query_delete_pop_up_open = function () {
            $scope.pop_up_form = "query_delete";
            window.scrollTo(0,0);
            $('.pop_up_window').fadeIn(100);
            $(".query_delete_container ul").append('<li class="light_back_option_even"><div class="col-xs-12 list_content"><i class="fa fa-search folder_listing"></i><span>' + $scope.right_clicked_query + '</span></div></li>');                  
            $('.query_deleter').fadeIn(100);
        };
        $scope.pop_up_close_clear = function () {

            $('.pop_up_window').fadeOut(200, function () {
                $(".move_container ul").empty();
                $(".delete_container ul").empty();
                $(".query_delete_container ul").empty();
                $('#new_collection_name').val('');
                $('.selected_object').empty();
                $('#new_renaming_name').val('');
                $('#new_renaming_name').removeClass('has_error');
                $('#new_collection_name').removeClass('has_error');
                $(".upload_container").css('display', 'block');
                $(".upload_container_result ul").empty();
                $(".upload_container_result").css('display', 'none');
                $('.uploader').fadeOut(100);
                $('.deleter').fadeOut(100);
                $('.query_deleter').fadeOut(100);
                $('.creater').fadeOut(100);
                $('.file_creater').fadeOut(100);
                $('.renamer').fadeOut(100);
                $('.copier').fadeOut(100);
                $('.mover').fadeOut(100);
                $('.copier_button').fadeOut(100);
                $('.mover_button').fadeOut(100);
                $scope.pop_up_form = "";
                $scope.files_to_upload = [];
                $scope.files_name = [];
                $("#select-result").empty();
                $(".download_button").animate({'opacity': '0.1'});
                $(".download_button").css('pointer-events', 'none');
                $(".rename_button").animate({'opacity': '0.1'});
                $(".rename_button").css('pointer-events', 'none');
                $(".rename_divider").animate({'opacity': '0.1'});
                $(".download_divider").animate({'opacity': '0.1'});
                $(".tablet_download_button").fadeOut();
                $(".tablet_rename_button").fadeOut();
                $(".empty_selection").fadeIn();
            });

        };
        $scope.pop_up_close = function () {

            $('.pop_up_window').fadeOut(200, function () {
                $(".move_container ul").empty();
                $(".delete_container ul").empty();
                $(".query_delete_container ul").empty();
                $('#new_collection_name').val('');
                $('.selected_object').empty();
                $('#new_renaming_name').val('');
                $('#new_renaming_name').removeClass('has_error');
                $('#new_collection_name').removeClass('has_error');
                $(".upload_container").css('display', 'block');
                $(".upload_container_result ul").empty();
                $(".upload_container_result").css('display', 'none');
                $('.uploader').fadeOut(100);
                $('.deleter').fadeOut(100);
                $('.query_deleter').fadeOut(100);
                $('.creater').fadeOut(100);
                $('.file_creater').fadeOut(100);
                $('.renamer').fadeOut(100);
                $('.copier').fadeOut(100);
                $('.mover').fadeOut(100);
                $('.copier_button').fadeOut(100);
                $('.mover_button').fadeOut(100);
                $scope.pop_up_form = "";
                $scope.files_to_upload = [];
                $scope.files_name = [];
            });

        };


        /**
         * INITIAL CALLS
         */

        $scope.listVirtualCollections();
        $scope.getBreadcrumbPaths();


        /*
         Retrieve the data profile for the data object at the given absolute path
         */
        $scope.selectProfile = function (irodsAbsolutePath, touch_event) {
            $log.info("going to Data Profile");
            if (!irodsAbsolutePath) {
                $log.error("missing irodsAbsolutePath")
                MessageService.danger("missing irodsAbsolutePath");
            }
            //alert("setting location..");
            //$location.search(null);

            $location.url("/profile/");
            $location.search("path", irodsAbsolutePath);
            $log.info('end: '+irodsAbsolutePath);
            if(touch_event == true){
                $scope.$apply();
            };

        };
        $scope.editFile = function (irodsAbsolutePath, touch_event,event) {
            $log.info("going to File edit");
            $log.info('end: '+irodsAbsolutePath);
            if (!irodsAbsolutePath) {
                $log.error("missing irodsAbsolutePath")
                MessageService.danger("missing irodsAbsolutePath");
            }
            //alert("setting location..");
            //$location.search(null);

            $location.url("/edit/");
            $location.search("path", irodsAbsolutePath);
            $log.info('end: '+irodsAbsolutePath);
            if(touch_event == true){
                $scope.$apply();
            };

        };
        $scope.hide_breadcrumbs = function () {
            $(".dark_back_option_double").removeClass("open");
        };

        

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
                var params = {"path": path};
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
                $log.info("listCollectionContents()");

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

                var promise = $http({
                    method: 'GET',
                    url: $globals.backendUrl('collection/') + reqVcName,
                    params: {path: reqParentPath, offset: reqOffset}
                }).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    $log.info("pagingAwareCollectionListing is:");
                    $log.info(response.data);
                    // The return value gets picked up by the then in the controller.
                    return response.data; // return CollectionAndDataObjectListingEntry as JSON
                });
                // Return the promise to the controller
                return promise;

            },
            addNewCollection: function (parentPath, childName) {
                $log.info("addNewCollection()");
            }


        };


    }])
;

