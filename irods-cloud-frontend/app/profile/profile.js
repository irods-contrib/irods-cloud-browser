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
        });
        $scope.$on('onRepeatLast', function (scope, element, attrs) {
                         
                $(".selectable").selectable({
                    stop: function (){ 
                        $('.q_column , .list_group_header').removeClass("ui-selected");
                        $('.q_column , .list_group_header').removeClass("ui-selectee");
                        var copy_path_display = $("#copy_select_result").empty();
                        var move_path_display = $("#move_select_result").empty();

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
                            move_path_display.append(move_path);
                            $scope.copy_target = $('.move_list_item.ui-selected').attr('id');
                        }
                        if ($(".move_list_item.ui-selected").length > 1) {
                            $('.move_list_item.ui-selected').not(':first').removeClass('ui-selected');
                            var move_path = $('.move_list_item.ui-selected').children('.list_content').children('.collection_object').text();
                            move_path_display.append(move_path);
                            $scope.move_target = $('.move_list_item.ui-selected').attr('id');
                        }
                        
                        if ($("li.ui-selected").length > 1) {
                            $('.single_action').fadeOut();
                        } else if ($("li.ui-selected").length == 1) {
                            $('.single_action').fadeIn();
                        } else if ($("li.ui-selected").length == 0) {
                            $('.single_action').fadeOut();
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
        $scope.current_page = 'info_view';
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
                    MessageService.success("Deletion completed!");
                window.setTimeout(function() {
                    $location.url("/home/root");
                    $location.search("path", $scope.dataProfile.parentPath);
                }, 2000);

                })
        };



        $scope.rename_action = function (){
            var rename_path = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
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
            $scope.copy_source = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
            $log.info('||||||||||||| copying:'+ $scope.copy_source +' to '+ $scope.copy_target);
            $http({
                method: 'POST',
                url: $globals.backendUrl('copy'),
                params: {sourcePath: $scope.copy_source, targetPath: $scope.copy_target, resource:'', overwrite: 'false' }
            }).then(function () {
                MessageService.success("Copy completed!"); 
                $scope.pop_up_close();
            })
        };   

        $scope.move_action = function (){
            $scope.copy_source = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;   
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

        $scope.star_action = function(){
            var star_path = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
            fileService.starFileOrFolder(star_path).then(function(d) {
                $scope.dataProfile.starred = true;
            });
            //location.reload();

        };
        $scope.unstar_action = function(){
            var unstar_path = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
            //fileService.unstarFileOrFolder(unstar_path);
            fileService.unstarFileOrFolder(unstar_path).then(function(d) {
                $scope.dataProfile.starred = false;
            });
            //location.reload();
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
            var move_path_display = $("#move_select_result").empty(); 
            var move_path = path_name;
            move_path_display.append(move_path);
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
        $scope.move_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            var move_path_display = $("#move_select_result").empty();
            var path_array = $scope.copy_list.data.pagingAwareCollectionListingDescriptor.pathComponents;
            var current_collection = path_array[path_array.length - 1];
            $scope.copy_source = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
            $scope.copy_target = $scope.dataProfile.parentPath;
            move_path_display.append(current_collection);
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
            $('.pop_up_window').fadeIn(100);
            var copy_path_display = $("#copy_select_result").empty();
            var path_array = $scope.copy_list.data.pagingAwareCollectionListingDescriptor.pathComponents;
            var current_collection = path_array[path_array.length - 1];
            $scope.copy_source = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
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
            $('.pop_up_window').fadeIn(100);
            $('.uploader').fadeIn(100);
        };

        $scope.rename_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            $('.renamer').fadeIn(100);
            $('#new_renaming_name').focus();
            var name_of_selection = $scope.dataProfile.childName;
            $('.selected_object').append(name_of_selection);
        };

        $scope.delete_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);                 
                 if($scope.dataProfile.file == true){
                        $(".delete_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/data_object_icon.png">&nbsp;'+$scope.dataProfile.parentPath + "/" +$scope.dataProfile.childName+'</div></li>');
                    }else{
                        $(".delete_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/collection_icon.png">&nbsp;'+$scope.dataProfile.parentPath + "/" +$scope.dataProfile.childName+'</div></li>');
                    }                        
            $('.deleter').fadeIn(100);
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
                $('.uploader').fadeOut(100);
                $('.deleter').fadeOut(100);
                $('.creater').fadeOut(100);
                $('.renamer').fadeOut(100);
                $('.copier').fadeOut(100);
                $('.mover').fadeOut(100);
                $('.copier_button').fadeOut(100);
                $('.mover_button').fadeOut(100);
            });
        };
        $scope.pop_up_close_asynch = function () {

            $('.pop_up_window').fadeOut(100, function () {
                $(".upload_container").css('display', 'block');
                $(".upload_container_result").html('<ul></ul>');
                $(".upload_container_result").css('display', 'none');
                $('.metadata_editor').fadeOut(100); 
                $('.metadata_adder').fadeOut(100);
                $('.metadata_deleter').fadeOut(100);
            });

        };


        /*|||||||||||||||||||||||||||||||
        |||||||| METADATA ACTIONS ||||||| 
        |||||||||||||||||||||||||||||||*/
        $scope.available_metadata = $scope.dataProfile.metadata;
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
            var data_path = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
            var new_attribute = $('#new_metadata_attribute').val();
            var new_value = $('#new_metadata_value').val();
            var new_unit = $('#new_metadata_unit').val();
            metadataService.addMetadataForPath(data_path, new_attribute, new_value, new_unit).then(function () {
               $http({method: 'GET', url: $globals.backendUrl('file') , params: {path: $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName}}).success(function(data){
                    $scope.new_meta = data;
                    $scope.available_metadata = $scope.new_meta.metadata;
               });
                $scope.pop_up_close_asynch();
            });

        };
        $scope.metadata_edit_action = function(){
            var data_path = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
            var new_attribute = $('#edit_metadata_attribute').val();
            var new_value = $('#edit_metadata_value').val();
            var new_unit = $('#edit_metadata_unit').val();            
            metadataService.updateMetadataForPath(data_path, $scope.old_metadata_attribute, $scope.old_metadata_value, $scope.old_metadata_unit, new_attribute, new_value, new_unit).then(function () {
               $http({method: 'GET', url: $globals.backendUrl('file') , params: {path: $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName}}).success(function(data){
                    $scope.new_meta = data;
                    $scope.available_metadata = $scope.new_meta.metadata;
               });
                $scope.pop_up_close_asynch();
            });

        };

        $scope.metadata_delete_action = function(){
            var data_path = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
            var new_attribute = $('#edit_metadata_attribute').val();
            var new_value = $('#edit_metadata_value').val();
            var new_unit = $('#edit_metadata_unit').val();            
            metadataService.deleteMetadataForPath(data_path, $scope.old_metadata_attribute, $scope.old_metadata_value, $scope.old_metadata_unit).then(function () {
               $http({method: 'GET', url: $globals.backendUrl('file') , params: {path: $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName}}).success(function(data){
                    $scope.new_meta = data;
                    $scope.available_metadata = $scope.new_meta.metadata;
               });
                $scope.pop_up_close_asynch();
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
   