'use strict';

angular.module('myApp.search', ['ngRoute', 'ngFileUpload', 'ng-context-menu','ui.codemirror'])

     .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/search/:vcName', {
            templateUrl: 'search/search.html',
            controller: 'searchCtrl',
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
        }).when('/search', {
            templateUrl: 'search/search.html',
            controller: 'searchCtrl',
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
    .directive("addAttr", function($compile){
        return function(scope, element, attrs){
            element.bind("click", function(){
                angular.element(document.getElementById('query_container')).append($compile('<div class="and_param"> <div style="width: 409px;position: relative;text-align: center;margin: 13px 0px;float: left;border-bottom: 1px solid #bbb;color: #999;"><b>and</b></div><div style="position:relative;float:left;"><b>*&nbsp;Attribute Name</b><br><input type="text" value="" class="attr_name"/></div><div style="position:relative;float:left;padding:12px 12px 0px 12px;"><select class="form-control attr_eval" ><option value="EQUAL"><b>=</b></option><option value="LESS"><b><</b></option><option value="MORE"><b>></b></option></select></div><div style="position:relative;float:left;"><b>*&nbsp;Attribute Value</b><br><input type="text" value="" class="attr_val"/></div><div style="position:relative;float:left;padding:22px 0px 0px 12px;"><div title="Remove this line of parameters" ng-click="remove_and_avu()"><img class="pop_up_close_clear_button" src="images/close_icon.png"></div></div></div>')(scope));
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
    .filter('iconic', function () {
        return function (input, optional) {
            var out = "";
            if (input == "virtual.collection.default.icon") {
                var out = "default_icon";
            } else if (input == "virtual.collection.icon.starred") {
                var out = "star_icon";
            }
            return out;
        };
    })
    .controller('searchCtrl', ['$scope', 'Upload', '$log', '$http', '$location', 'MessageService', 'globals', 'breadcrumbsService', 'downloadService', 'virtualCollectionsService', 'collectionsService', 'fileService', 'selectedVc', 'pagingAwareCollectionListing', function ($scope, Upload, $log, $http, $location, MessageService, $globals, breadcrumbsService, downloadService, $virtualCollectionsService, $collectionsService, fileService, selectedVc, pagingAwareCollectionListing) {

        /*
         basic scope data for collections and views
         */
        $scope.count = 0;
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
        $scope.query_search = function (){
            if($('#search_objs').val() == null){
                MessageService.danger("Please choose what you want to search for");
                $("#search_objs").focus();
                return;
            };
            var query_val = '{"targetZone":"","queryType":"'+ $('#search_objs').val() +'","pathHint":"","metadataQueryElements":[';
            var attr_names = [];
            $(".attr_name").each(function() {
                attr_names.push($(this).val());
            });
            var attr_vals = [];
            $(".attr_val").each(function() {
                attr_vals.push($(this).val());
            });
            var attr_evals = [];
            $(".attr_eval").each(function() {
                attr_evals.push($(this).val());
            });

            for (var i = 0; i < attr_names.length; i++) {

                if(attr_names[i].value == ""){
                    MessageService.danger("Missing Attribute Name");
                    return;
                }
                if(attr_vals[i].value == ""){
                    MessageService.danger("Missing Attribute Value");
                    return;
                }

                query_val += '{"attributeName":"'+attr_names[i]+'","operator":"'+attr_evals[i]+'","attributeValue":["'+attr_vals[i]+'"],"connector":"AND"},';
            }
            query_val += ']}';
            return $http({
                    method: 'POST',
                    url: $globals.backendUrl('metadataQuery'),
                    data:query_val,
                    dataType: "json",
                    params:{uniqueName:$scope.url_query_name.query_id}
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
                    
                })
        }
        $scope.get_query_params($scope.url_query_name.query_id);
        $scope.remove_and_avu = function(){
            $(event.target).closest(".and_param").remove();
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

