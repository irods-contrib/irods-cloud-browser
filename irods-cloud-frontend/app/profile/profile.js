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
                    window.history.go(-1);
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
            return $http({
                    method: 'PUT',
                    url: $globals.backendUrl('rename'),
                    params: {path: rename_path, newName: new_name}
                }).success(function (data) {
                    location.assign(new_url);       
                })
        };

        $scope.copy_action = function (){
            $scope.copy_source = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;        
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
            $scope.copy_source = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;       
            $scope.copy_target = $('.move_list_item.ui-selected').attr('id');
            $log.info('||||||||||||| moving:'+ $scope.copy_source +' to '+ $scope.copy_target);
            return $http({
                    method: 'POST',
                    url: $globals.backendUrl('move'),
                    params: {sourcePath: $scope.copy_source, targetPath: $scope.copy_target, resource:'', overwrite: 'false' }
                }).success(function () {
                    window.history.go(-1);
                    MessageService.success("Move completed!");
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
        $scope.move_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            $(".move_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/data_object_icon.png">'+$scope.dataProfile.childName+'</div></li>'); 
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
            $(".copy_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/data_object_icon.png">'+$scope.dataProfile.childName+'</div></li>');                    
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

        $scope.upload_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            $('.uploader').fadeIn(100);
        };

        $scope.rename_pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
            $('.renamer').fadeIn(100);
            var name_of_selection = $('.ui-selected').children('.list_content').children('.data_object').text();
            $('.selected_object').append(name_of_selection);
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
   