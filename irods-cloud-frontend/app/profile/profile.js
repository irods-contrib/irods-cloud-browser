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
.directive('onLastRepeat', function () {
        return function (scope, element, attrs) {
            if (scope.$last) setTimeout(function () {
                scope.$emit('onRepeatLast', element, attrs);
            }, 1);
        };
    })
    .controller('profileCtrl', ['$scope','$log', 'Upload', '$http', '$location', 'MessageService','globals','breadcrumbsService','virtualCollectionsService','collectionsService','fileService','metadataService','dataProfile',function ($scope, $log, Upload, $http, $location, MessageService, $globals, breadcrumbsService, $virtualCollectionsService, $collectionsService, fileService, metadataService, dataProfile) {

        $scope.dataProfile = dataProfile;
        $scope.pop_up_form = "";
        
        $http({
            method: 'GET',
            url: $globals.backendUrl('collection/') + 'root',
            params: {
                path: $scope.dataProfile.parentPath,
                offset: 0
            }
        }).then(function (data) {
            $scope.copy_list = data;
        }).then(function () {
            return $http({
                method: 'GET',
                url: $globals.backendUrl('virtualCollection/') + 'root'
            })   
        }).then(function (data) {
            $scope.copyVC = data;
            $scope.getBreadcrumbPaths();
        });
        $scope.getBreadcrumbPaths = function () {      
            $scope.breadcrumb_full_array = $scope.copy_list.data.pagingAwareCollectionListingDescriptor.parentAbsolutePath.split("/");
            $scope.breadcrumb_full_array.shift();
            $scope.breadcrumb_full_array_paths = [];
            var totalPath = "";
            for (var i = 0; i < $scope.breadcrumb_full_array.length; i++) {
                    totalPath = totalPath + "/" + $scope.breadcrumb_full_array[i];
                    $scope.breadcrumb_full_array_paths.push({b:$scope.breadcrumb_full_array[i],path:totalPath});
                }
            if($scope.breadcrumb_full_array.length > 5){
                $scope.breadcrumb_compressed_array = $scope.breadcrumb_full_array_paths.splice(0,($scope.breadcrumb_full_array_paths.length)-5);                
            }else{
                $scope.breadcrumb_compressed_array = [];
            }
        }
        $scope.goToBreadcrumb = function (path) {

            if (!path) {
                $log.error("cannot go to breadcrumb, no path");
                return;
            }
            $location.path("/home/root");
            $location.search("path", path);

        };
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
                        $(".download_button").css('opacity', '0.8');
                        $(".download_button").css('pointer-events', 'auto');
                        $(".rename_button").css('opacity', '0.1');
                        $(".rename_button").css('pointer-events', 'none');
                        $(".rename_divider").css('opacity', '0.8');
                        $(".download_divider").css('opacity', '0.8');

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
                        $(".download_button").css('opacity', '0.8');
                        $(".download_button").css('pointer-events', 'auto');
                        $(".rename_button").css('opacity', '0.8');
                        $(".rename_button").css('pointer-events', 'auto');
                        $(".rename_divider").css('opacity', '0.8');
                        $(".download_divider").css('opacity', '0.8');
                        $(".tablet_download_button").fadeIn();
                        $(".tablet_rename_button").fadeIn();
                        $(".empty_selection").fadeOut();
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
        /*
         Get a default list of the virtual collections that apply to the logged in user, for side nav
         */
        $scope.go_back = function(){
            window.history.go(-1);
        };
        $scope.listVirtualCollections = function () {            
            $log.info("getting virtual colls");

            return $http({method: 'GET', url: $globals.backendUrl('virtualCollection')}).success(function (data) {
                $scope.virtualCollections = data;
            }).error(function () {
                $scope.virtualCollections = [];
            });
        };
       $scope.listVirtualCollections();
               
        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });
        $scope.multiple = true;
        $scope.current_page = 'info_view';
        $scope.files_to_upload = [];
        $scope.files_name = [];


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
                        $(".upload_container_result ul").append('<li id="uploading_item_' + i + '" class="light_back_option_even"><div class="col-xs-10 list_content"><img src="images/data_object_icon.png">' + file.name + '</div></li>');
                    }
                }
            }

        }
        $scope.upload = function () {

            if ($scope.files_to_upload && $scope.files_to_upload.length) {
                for (var i = 0; i < $scope.files_to_upload.length; i++) {
                    var file = $scope.files_to_upload[i];
                    Upload.upload({
                        url: $globals.backendUrl('file'),
                        fields: {collectionParentName: $scope.dataProfile.domainObject.absolutePath},
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $log.info(progressPercentage);
                    }).then(function (data) {
                        return $collectionsService.listCollectionContents($scope.copyVC.data.uniqueName, $scope.dataProfile.domainObject.absolutePath, 0);
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
        $scope.save_content_action = function () {
            $log.info("saving file content");
                return $http({
                    method: 'POST', 
                    url: $globals.backendUrl('fileEdit'),
                    params: {
                        data:$scope.file_content,
                        irodsPath: $scope.dataProfile.domainObject.absolutePath
                    }
                }).success(function (data) {
                    location.reload();
                }).error(function () {
                });
            

        };
        

        $scope.delete_action = function (){
            var delete_paths = $scope.dataProfile.domainObject.absolutePath;
            $log.info('Deleting:'+delete_paths);
            return $http({
                    method: 'DELETE',
                    url: $globals.backendUrl('file'),
                    params: {
                        path : delete_paths
                    }
                }).then(function (data) {
                MessageService.info("Deletion completed!");
                window.history.back();
            })
        };

        $scope.rename_action = function (){
            var rename_path = $scope.dataProfile.domainObject.absolutePath;
            var new_name = $('#new_renaming_name').val();
            var old_url = window.location;
            var n = String(old_url).lastIndexOf("%2F");
            var new_url = String(old_url).substr(0,n);
            var new_url = new_url + "%2F" + new_name;
            $log.info('Renaming:'+rename_path);
            var data_name_unique = 'yes';
            for (var i = 0; i < $scope.copy_list.data.collectionAndDataObjectListingEntries.length; i++) {
                var file = $scope.copy_list.data.collectionAndDataObjectListingEntries[i];
                if (new_name === file.nodeLabelDisplayValue) {
                    MessageService.danger('There is already an item named "' + new_name + '", please choose a different name');
                    data_name_unique = "no";
                    $('#new_renaming_name').addClass('has_error');
                    $('#new_renaming_name').focus();
                } 
            }
            if(data_name_unique === "yes"){
                $log.info('Renaming:' + rename_path );
                $http({
                    method: 'PUT',
                    url: $globals.backendUrl('rename'),
                    params: {path: rename_path, newName: new_name}
                }).then(function (data) {
                    MessageService.success("Renaming completed!");
                    location.assign(new_url);
                })
            }
        };

        $scope.copy_action = function (){
            $scope.copy_source = $scope.dataProfile.domainObject.absolutePath;
            $log.info('||||||||||||| copying:'+ $scope.copy_source +' to '+ $scope.copy_target);
            $http({
                method: 'POST',
                url: $globals.backendUrl('copy'),
                params: {sourcePath: $scope.copy_source, targetPath: $scope.copy_target, resource:'', overwrite: 'false' }
            }).then(function () {
                MessageService.success("Copy completed!"); 
                $scope.pop_up_close_clear();
            })
        };   

        $scope.move_action = function (){
            $scope.copy_source = $scope.dataProfile.domainObject.absolutePath;   
            var new_name = $scope.dataProfile.childName;
            var old_url = window.location;
            var n = String(old_url).lastIndexOf("=");
            var new_url = String(old_url).substr(0,n);
            var new_url = new_url + "=" + $scope.copy_target + "%2F" + new_name;
            $log.info('||||||||||||| moving:'+ $scope.copy_source +' to '+ $scope.copy_target);
            $http({
                method: 'POST',
                url: $globals.backendUrl('move'),
                params: {sourcePath: $scope.copy_source, targetPath: $scope.copy_target, resource:'', overwrite: 'false' }
            }).then(function () {
                MessageService.success("Move completed!");    
                location.assign(new_url);  
            })
        };
                 
        $scope.getCopyBreadcrumbPaths = function () {      
            $scope.breadcrumb_popup_full_array = $scope.copy_list.data.pagingAwareCollectionListingDescriptor.parentAbsolutePath.split("/");
            $scope.breadcrumb_popup_full_array.shift();
            $scope.breadcrumb_popup_full_array_paths = [];
            var popup_totalPath = "";
            for (var i = 0; i < $scope.breadcrumb_popup_full_array.length; i++) {
                    popup_totalPath = popup_totalPath + "/" + $scope.breadcrumb_popup_full_array[i];
                    $scope.breadcrumb_popup_full_array_paths.push({b:$scope.breadcrumb_popup_full_array[i],path:popup_totalPath});
                }
            if($scope.breadcrumb_popup_full_array.length > 5){
                $scope.breadcrumb_popup_compressed_array = $scope.breadcrumb_popup_full_array_paths.splice(0,($scope.breadcrumb_popup_full_array_paths.length)-5);                
            }else{
                $scope.breadcrumb_popup_compressed_array = [];
            }
        }
        $scope.set_path = function (path_name,path) {  
            var copy_path_display = $(".copy_select_result").empty(); 
            var move_path = path_name;
            copy_path_display.append(move_path);
            $scope.copy_target = path;  
        };
        $scope.hide_breadcrumbs = function () {
            $(".dark_back_option_double").removeClass("open");
        };
        $scope.copy_list_refresh = function (VC, selectedPath) {                     
            if(VC == ""){
                var pop_up_vc = 'root';
            }else{
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
                if($scope.copyVC.data.type == 'COLLECTION'){
                    $scope.getCopyBreadcrumbPaths();
                }
            });
            
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
        $(window).keyup(function($event){   
            if($event.keyCode == "13"){         
                if($scope.pop_up_form === "delete"){
                    $scope.pop_up_form = "";
                    $scope.delete_action();
                }
                if($scope.pop_up_form === "upload"){
                    $scope.upload();
                }
                if($scope.pop_up_form === "copy"){
                    $scope.pop_up_form = "";
                    $scope.copy_action();
                }
                if($scope.pop_up_form === "move"){
                    $scope.pop_up_form = "";
                    $scope.move_action();
                }
                if($scope.pop_up_form === "create"){
                    $scope.pop_up_form = "";
                    $scope.create_collection_action();
                }
                if($scope.pop_up_form === "rename"){
                    $scope.pop_up_form = "";
                    $scope.rename_action();
                }
            }
        });
        $scope.move_pop_up_open = function(){
            $scope.pop_up_form = "move";
            $scope.copy_source = $('.general_list_item .ui-selected').attr('id');
            $('.pop_up_window').fadeIn(100);
            var copy_path_display = $(".copy_select_result").empty();
            var path_array = $scope.copy_list.data.pagingAwareCollectionListingDescriptor.pathComponents;
            var current_collection = path_array[path_array.length - 1];
            $scope.copy_source = $scope.dataProfile.domainObject.absolutePath;
            $scope.copy_target = $scope.dataProfile.parentPath;
            copy_path_display.append(current_collection);
            if ($scope.dataProfile.file == true) {
                $(".move_container ul").append('<li class="light_back_option_even"><div class="col-xs-12 list_content"><img src="images/data_object_icon.png">' + $scope.dataProfile.childName + '</div></li>');
            } else {
                $(".move_container ul").append('<li class="light_back_option_even"><div class="col-xs-12 list_content"><img src="images/collection_icon.png">' + $scope.dataProfile.childName + '</div></li>');
            };
            $('.mover').fadeIn(100);
            $('.mover_button').fadeIn(100);
            $http({
                method: 'GET',
                url: $globals.backendUrl('virtualCollection')
            }).then(function (data) {
                $scope.copy_vc_list = data;  
                $scope.getCopyBreadcrumbPaths();              
            });
        };
        $scope.copy_pop_up_open = function(){
            $scope.pop_up_form = "copy";
            $scope.copy_source = $('.general_list_item .ui-selected').attr('id');
            $('.pop_up_window').fadeIn(100);
            var copy_path_display = $(".copy_select_result").empty();
            var path_array = $scope.copy_list.data.pagingAwareCollectionListingDescriptor.pathComponents;
            var current_collection = path_array[path_array.length - 1];
            $scope.copy_source = $scope.dataProfile.domainObject.absolutePath;
            $scope.copy_target = $scope.dataProfile.parentPath;
            copy_path_display.append(current_collection);
            if ($scope.dataProfile.file == true) {
                $(".copy_container ul").append('<li class="light_back_option_even"><div class="col-xs-12 list_content"><img src="images/data_object_icon.png">' + $scope.dataProfile.childName + '</div></li>');
            } else {
                $(".copy_container ul").append('<li class="light_back_option_even"><div class="col-xs-12 list_content"><img src="images/collection_icon.png">' + $scope.dataProfile.childName + '</div></li>');
            };
            $('.copier').fadeIn(100);
            $('.copier_button').fadeIn(100);
            $http({
                method: 'GET',
                url: $globals.backendUrl('virtualCollection')
            }).then(function (data) {
                $scope.copy_vc_list = data;  
                $scope.getCopyBreadcrumbPaths();              
            });
        };
        $scope.upload_pop_up_open = function(){
            $scope.upload_folder_name = $scope.dataProfile.childName;
            $scope.pop_up_form = "upload";
            $('.pop_up_window').fadeIn(100);
            $('.uploader').fadeIn(100);
        };

        $scope.rename_pop_up_open = function(){
            $scope.pop_up_form = "rename";
            $('.pop_up_window').fadeIn(100);
            $('.renamer').fadeIn(100);
            $('#new_renaming_name').focus();
            var name_of_selection = $scope.dataProfile.childName;
            $('.selected_object').append(name_of_selection);
        };

        $scope.delete_pop_up_open = function(){
            $scope.pop_up_form = "delete";
            $('.pop_up_window').fadeIn(100);                 
                 if($scope.dataProfile.file == true){
                        $(".delete_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/data_object_icon.png">&nbsp;'+$scope.dataProfile.domainObject.absolutePath+'</div></li>');
                    }else{
                        $(".delete_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/collection_icon.png">&nbsp;'+$scope.dataProfile.domainObject.absolutePath+'</div></li>');
                    }                        
            $('.deleter').fadeIn(100);
        };
        $scope.pop_up_close_clear = function () {

            $('.pop_up_window').fadeOut(200, function () {
                $(".move_container ul").empty();
                $(".delete_container ul").empty();
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
                $('.creater').fadeOut(100);
                $('.renamer').fadeOut(100);
                $('.copier').fadeOut(100);
                $('.mover').fadeOut(100);
                $('.metadata_adder').fadeOut(100);
                $('.metadata_editor').fadeOut(100);
                $('.metadata_deleter').fadeOut(100);
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
                $('#new_collection_name').val('');
                $('.selected_object').empty();
                $('#new_renaming_name').val('');
                $('#new_renaming_name').removeClass('has_error');
                $('#new_collection_name').removeClass('has_error');
                $(".upload_container").css('display', 'block');
                $(".upload_container_result ul").empty();
                $(".upload_container_result").css('display', 'none');
                $('.metadata_adder').fadeOut(100);
                $('.metadata_editor').fadeOut(100);
                $('.metadata_deleter').fadeOut(100);
                $('.uploader').fadeOut(100);
                $('.deleter').fadeOut(100);
                $('.creater').fadeOut(100);
                $('.renamer').fadeOut(100);
                $('.copier').fadeOut(100);
                $('.mover').fadeOut(100);
                $('.copier_button').fadeOut(100);
                $('.mover_button').fadeOut(100);
                $('#new_metadata_attribute').removeClass('has_error');
                $('#new_metadata_value').removeClass('has_error');
                $scope.pop_up_form = "";
                $scope.files_to_upload = [];
                $scope.files_name = [];
            });

        };
        $(window).mousedown(function(event) {
            switch (event.which) {
                case 1:
                    if($(event.target).is("div")){
                        if ($(event.target).parents().hasClass("ui-selectee") || $(event.target).parents().hasClass("selection_actions_container") || $(event.target).parents().hasClass("pop_up_window")) {
                            
                        }else{
                            $(".general_list_item .ui-selected").removeClass("ui-selected");
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
                        }
                    }
                    break;
                case 3:
                    if ($(".general_list_item .ui-selected").length == 0 || $(".general_list_item .ui-selected").length == 1) {
                        $(".general_list_item .ui-selected").removeClass("ui-selected");
                        $(event.target).parents("li").addClass("ui-selected","fast",function(){
                            $(".download_button").css('opacity','0.8');
                            $(".download_button").css('pointer-events', 'auto');
                            $(".rename_button").css('opacity','0.8');
                            $(".rename_button").css('pointer-events', 'auto');
                            $(".rename_divider").css('opacity','0.8');
                            $(".download_divider").css('opacity','0.8');
                            $(".tablet_download_button").fadeIn();
                            $(".tablet_rename_button").fadeIn();
                            $(".empty_selection").fadeOut();
                        });
                    }
                    if ($(".general_list_item .ui-selected").length > 1) {
                        if(!$(event.target).parents("li").hasClass("ui-selected")){
                            $(".general_list_item .ui-selected").removeClass("ui-selected");
                            $(event.target).parents("li").addClass("ui-selected","fast",function(){
                                $(".download_button").css('opacity','0.8');
                                $(".download_button").css('pointer-events', 'auto');
                                $(".rename_button").css('opacity','0.8');
                                $(".rename_button").css('pointer-events', 'auto');
                                $(".rename_divider").css('opacity','0.8');
                                $(".download_divider").css('opacity','0.8');
                                $(".tablet_download_button").fadeIn();
                                $(".tablet_rename_button").fadeIn();
                                $(".empty_selection").fadeOut();
                            });
                        }
                    }
                    break;
            }
        });

        /*|||||||||||||||||||||||||||||||
        |||||||| METADATA ACTIONS ||||||| 
        |||||||||||||||||||||||||||||||*/
        $scope.available_metadata = $scope.dataProfile.metadata;
        $scope.star_action = function(){
            var star_path = $scope.dataProfile.domainObject.absolutePath;
            fileService.starFileOrFolder(star_path).then(function() {
                $http({method: 'GET', url: $globals.backendUrl('file') , params: {path: $scope.dataProfile.domainObject.absolutePath}}).success(function(data){
                    $scope.new_meta = data;
                    $scope.available_metadata = $scope.new_meta.metadata;
                });
                $scope.pop_up_close_clear();
                $scope.dataProfile.starred = true;
            });
            //location.reload();

        };
        $scope.unstar_action = function(){
            var unstar_path = $scope.dataProfile.domainObject.absolutePath;
            //fileService.unstarFileOrFolder(unstar_path);
            fileService.unstarFileOrFolder(unstar_path).then(function() {
                $http({method: 'GET', url: $globals.backendUrl('file') , params: {path: $scope.dataProfile.domainObject.absolutePath}}).success(function(data){
                    $scope.new_meta = data;
                    $scope.available_metadata = $scope.new_meta.metadata;
                });
                $scope.pop_up_close_clear();
                $scope.dataProfile.starred = false;
            });
            //location.reload();
        };
        $scope.add_metadata_pop_up = function (){
            $('#new_metadata_attribute').val('');
            $('#new_metadata_value').val('');
            $('#new_metadata_unit').val('');
            $('.pop_up_window').fadeIn(100); 
            $('.metadata_adder').fadeIn(100); 
        };
        $scope.edit_metadata_pop_up = function (){
            $('.pop_up_window').fadeIn(100); 
            $('.metadata_editor').fadeIn(100); 
            $('#edit_metadata_attribute').val($('.metadata_item.ui-selected').children('.metadata_attribute').text());
            $('#edit_metadata_value').val($('.metadata_item.ui-selected').children('.metadata_value').text());
            $('#edit_metadata_unit').val($('.metadata_item.ui-selected').children('.metadata_unit').text());
            $scope.old_metadata_attribute = $('.metadata_item.ui-selected').children('.metadata_attribute').text();
            $scope.old_metadata_value = $('.metadata_item.ui-selected').children('.metadata_value').text();
            $scope.old_metadata_unit = $('.metadata_item.ui-selected').children('.metadata_unit').text();
        };

        $scope.delete_metadata_pop_up = function(){
            $('.pop_up_window').fadeIn(100); 
            $scope.delete_objects = $('.metadata_item.ui-selected');
            $scope.old_metadata_attribute = $('.metadata_item.ui-selected').children('.metadata_attribute').text();
            $scope.old_metadata_value = $('.metadata_item.ui-selected').children('.metadata_value').text();
            $scope.old_metadata_unit = $('.metadata_item.ui-selected').children('.metadata_unit').text();
            $log.info($scope.delete_objects);
            $(".metadata_delete_container ul").empty();
            $(".metadata_delete_container ul").append('<li class="light_back_option_even"><div class="q_column"><b>ATTRIBUTE</b></div><div class="q_column"><b>VALUE</b></div><div class="q_column"><b>UNIT</b></div></li>');
            $scope.delete_objects.each(function () {
                
                    $(".metadata_delete_container ul").append('<li class="light_back_option_even"><div class="q_column">'+$(this).children('.metadata_attribute').text()+'</div><div class="q_column">'+$(this).children('.metadata_value').text()+'</div><div class="q_column">'+$(this).children('.metadata_unit').text()+'</div></li>');
                
            }); 
            $('.metadata_deleter').fadeIn(100); 

        };

        $scope.metadata_add_action = function(){
            $('#new_metadata_attribute').removeClass('has_error');
            $('#new_metadata_value').removeClass('has_error');
            var data_path = $scope.dataProfile.domainObject.absolutePath;
            var new_attribute = $('#new_metadata_attribute').val();
            var new_value = $('#new_metadata_value').val();
            var new_unit = $('#new_metadata_unit').val();
            var att_unique = 'yes';
            var value_unique = 'yes';
            for (var i = 0; i < $scope.available_metadata.length; i++) {
                var avu = $scope.available_metadata[i];
                if (new_attribute === avu.avuAttribute) {
                    att_unique = "no";
                }
                if (new_value === avu.avuValue) {
                    value_unique = "no";
                }
            }
            if(value_unique == "no" && att_unique == "no"){
                MessageService.danger('There is already an AVU with Attribute: "' + new_attribute + '" and Value: "' + new_value + '". Please choose a different Attribute or Value');                    
                $('#new_metadata_attribute').addClass('has_error');
                $('#new_metadata_value').addClass('has_error');
                $('#new_metadata_attribute').focus();
            }else if (new_attribute == "" ){
                MessageService.danger("The Attribute field can't be blank, please provide an Attribute");
                $('#new_metadata_attribute').addClass('has_error');
                $('#new_metadata_attribute').focus();
            }else if (new_value == ""){
                MessageService.danger("The Value field can't be blank, please provide a Value");
                $('#new_metadata_value').addClass('has_error');
                $('#new_metadata_value').focus();
            }else{
                metadataService.addMetadataForPath(data_path, new_attribute, new_value, new_unit).then(function () {
                   $http({method: 'GET', url: $globals.backendUrl('file') , params: {path: $scope.dataProfile.domainObject.absolutePath}}).success(function(data){
                        $scope.new_meta = data;
                        $scope.available_metadata = $scope.new_meta.metadata;
                   });
                    $scope.pop_up_close_clear();
                });
            }
        };
        $scope.metadata_edit_action = function(){
            var data_path = $scope.dataProfile.domainObject.absolutePath;
            var new_attribute = $('#edit_metadata_attribute').val();
            var new_value = $('#edit_metadata_value').val();
            var new_unit = $('#edit_metadata_unit').val();            
            metadataService.updateMetadataForPath(data_path, $scope.old_metadata_attribute, $scope.old_metadata_value, $scope.old_metadata_unit, new_attribute, new_value, new_unit).then(function () {
               $http({method: 'GET', url: $globals.backendUrl('file') , params: {path: $scope.dataProfile.domainObject.absolutePath}}).success(function(data){
                    $scope.new_meta = data;
                    $scope.available_metadata = $scope.new_meta.metadata;
               });
                $scope.pop_up_close_clear();
            });

        };

        $scope.metadata_delete_action = function(){
            var data_path = $scope.dataProfile.domainObject.absolutePath;
            var new_attribute = $('#edit_metadata_attribute').val();
            var new_value = $('#edit_metadata_value').val();
            var new_unit = $('#edit_metadata_unit').val();            
            metadataService.deleteMetadataForPath(data_path, $scope.old_metadata_attribute, $scope.old_metadata_value, $scope.old_metadata_unit).then(function () {
               $http({method: 'GET', url: $globals.backendUrl('file') , params: {path: $scope.dataProfile.domainObject.absolutePath}}).success(function(data){
                    $scope.new_meta = data;
                    $scope.available_metadata = $scope.new_meta.metadata;
               });
                $scope.pop_up_close_clear();
            });

        };

        /*||||||||||||||||||||||||||||||||||||||
        |||||||| END OF METADATA ACTIONS ||||||| 
        ||||||||||||||||||||||||||||||||||||||*/

        $scope.green_action_toggle= function($event){
          var content = $event.currentTarget.nextElementSibling;
          var container = $event.currentTarget.parentElement;
          $(content).toggle('normal');
          $(container).toggleClass('green_toggle_container_open');
        };

        $scope.getDownloadLink = function() {
            return  $globals.backendUrl('download') + "?path=" + $scope.dataProfile.domainObject.absolutePath;

        };
        

        /**
         * Upon the selection of an element in a breadrumb link, set that as the location of the browser, triggering
         * a view of that collection
         * @param index
         */
        

    }]);
   