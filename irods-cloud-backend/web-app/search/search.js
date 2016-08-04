'use strict';

angular.module('myApp.search', ['ngRoute', 'ngFileUpload', 'ng-context-menu','ui.codemirror'])

     .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/search', {
            templateUrl: 'search/search.html',
            controller: 'searchCtrl',
            resolve: {
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
    .directive("addAttr", function($compile){
        return function(scope, element, attrs){
            element.bind("click", function(){
                angular.element(document.getElementById('query_container')).append($compile('<div class="and_param left col-xs-12"> <div style="width: 409px;position: relative;text-align: center;margin: 13px 0px;float: left;border-bottom: 1px solid #bbb;color: #999;"><b>and</b></div><div style="position:relative;float:left;"><b>*&nbsp;Attribute Name</b><br><input type="text" value="" class="attr_name"/></div><div style="position:relative;float:left;padding:12px 12px 0px 12px;"><select class="form-control attr_eval" ><option value="EQUAL"><b>=</b></option><option value="LESS"><b><</b></option><option value="MORE"><b>></b></option></select></div><div style="position:relative;float:left;"><b>*&nbsp;Attribute Value</b><br><input type="text" value="" class="attr_val"/></div><div style="position:relative;float:left;padding:22px 0px 0px 12px;"><div title="Remove this line of parameters" ng-click="remove_and_avu()"><img class="pop_up_close_clear_button" src="images/close_icon.png"></div></div></div>')(scope));
            });
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
    .controller('searchCtrl', ['$scope', 'Upload', '$log', '$http', '$location', 'MessageService', 'globals', 'breadcrumbsService', 'downloadService', 'virtualCollectionsService', 'collectionsService', 'fileService', 'selectedVc', 'pagingAwareCollectionListing', function ($scope, Upload, $log, $http, $location, MessageService, $globals, breadcrumbsService, downloadService, $virtualCollectionsService, $collectionsService, fileService, selectedVc, pagingAwareCollectionListing) {

        /*
         basic scope data for collections and views
         */
        $scope.count = 0;
        $scope.selectedVc = selectedVc;
        $scope.pagingAwareCollectionListing = pagingAwareCollectionListing;     
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

        $scope.query_search = function (){
            $scope.display_name = $('.display_name').val()
            if($scope.display_name == ""){
                MessageService.danger("Missing Search Name");
                $('.display_name').focus();
                throw new Error("Missing Search Name");
            }
            var query_val = '{"targetZone":"","queryType":"'+ $('#search_objs').val() +'","pathHint":"'+$('.search_path').val()+'","metadataQueryElements":[';
            var attr_names = [];
            $(".attr_name").each(function() {
                if($(this).parent().parent().hasClass('ng-hide')){

                }else{
                    if($(this).val() == ""){
                        MessageService.danger("Missing Attribute Name");
                        $(this).focus();
                        throw new Error("Missing Attribute Name");
                    }else{
                        attr_names.push($(this).val());
                    }
                    
                }
            });
            var attr_vals = [];
            $(".attr_val").each(function() {
                if($(this).parent().parent().hasClass('ng-hide')){

                }else{
                    if($(this).val() == ""){
                        MessageService.danger("Missing Attribute Value");
                        $(this).focus();
                        throw new Error("Missing Attribute Value");
                    }else{
                        attr_vals.push($(this).val());
                    }
                }
            });
            var attr_evals = [];
            $(".attr_eval").each(function() {
                if($(this).parent().parent().hasClass('ng-hide')){

                }else{
                    attr_evals.push($(this).val());
                }
            });

            for (var i = 0; i < attr_names.length; i++) {

                if(attr_names[i] == ""){
                    MessageService.danger("Missing Attribute Name");
                    return;
                }
                if(attr_vals[i] == ""){
                    MessageService.danger("Missing Attribute Value");
                    return;
                }

                query_val += '{"attributeName":"'+attr_names[i]+'","operator":"'+attr_evals[i]+'","attributeValue":["'+attr_vals[i]+'"],"connector":"AND"},';
            }
            query_val += ']}';
            $log.info(query_val);
            return $http({
                    method: 'POST',
                    url: $globals.backendUrl('metadataQuery'),
                    data:query_val,
                    dataType: "json",
                    params:{uniqueName:$scope.url_query_name.query_id, description:$scope.display_name}
                }).success(function (data) {
                    $scope.selectVirtualCollection(data.vcName,"");   
                })         
        };
        $scope.url_query_name = $location.search();
        $scope.get_query_params = function (query_name){
            return $http({
                    method: 'GET',
                    url: $globals.backendUrl('metadataQuery'),
                    params: {uniqueName:query_name}
                }).success(function (data) {
                    $scope.query_vc = data;
                    var param_string = $scope.query_vc.queryString;
                    $scope.query_params = JSON.parse(param_string);
                    
                }).error(function (data){
                    $(".display_name").val("New Query");
                    $(".display_name").focus();
                })
        }
        $scope.get_query_params($scope.url_query_name.query_id);
        $scope.remove_and_avu = function(){
            $(event.target).closest(".and_param").remove();
        };

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

        $scope.path_pop_up_open = function () {     
            $scope.pop_up_form = "path_picker";
            window.scrollTo(0,0);      
            $scope.copyVC = $scope.selectedVc;
            $('.pop_up_window').fadeIn(100);
            var copy_path_display = $(".copy_select_result").empty();
            var path_array = $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.pathComponents;
            var current_collection = path_array[path_array.length - 1];
            $scope.name_of_selection = $('.ui-selected');
            $scope.copy_target = $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath;
            copy_path_display.append(current_collection);
            $scope.name_of_selection.each(function () {
                if ($(this).attr('id') != undefined) {
                    if ($(this).hasClass("data_true")) {
                        $(".move_container ul").append('<li class="light_back_option_even"><div class="col-xs-12 list_content"><img src="images/data_object_icon.png">' + $(this).attr('id') + '</div></li>');
                    } else {
                        $(".move_container ul").append('<li class="light_back_option_even"><div class="col-xs-12 list_content"><img src="images/collection_icon.png">' + $(this).attr('id') + '</div></li>');
                    }
                    ;
                }
                ;
            });
            $('.path_picker').fadeIn(100);
            $('.path_picker_button').fadeIn(100);
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

        $scope.path_pick_action = function () {
            $('.search_path').val($scope.copy_target);
            $scope.pop_up_close();
        };
        
        $scope.pop_up_close = function () {

            $('.pop_up_window').fadeOut(200, function () {
                $(".move_container ul").empty();
                $('.path_picker').fadeOut(100);
                $('.path_picker_button').fadeOut(100);
                $scope.pop_up_form = "";
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

            $location.path("/search/root");
            $location.search("path", breadcrumbsService.buildPathUpToIndex(index));

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

    }])
;

