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
    .controller('homeCtrl', ['$scope', 'Upload', '$log', '$http', '$location', 'MessageService', 'globals', 'breadcrumbsService', 'virtualCollectionsService', 'collectionsService', 'fileService', 'selectedVc', 'pagingAwareCollectionListing', function ($scope, Upload, $log, $http, $location, MessageService, $globals, breadcrumbsService, $virtualCollectionsService, $collectionsService, fileService, selectedVc, pagingAwareCollectionListing) {

        /*
         basic scope data for collections and views
         */

        $scope.selectedVc = selectedVc;
        $scope.pagingAwareCollectionListing = pagingAwareCollectionListing.data;

        $scope.$on('onRepeatLast', function (scope, element, attrs) {
            $("#selectable").selectable({
                stop: function () {
                    $('.list_content').removeClass("ui-selected");
                    var result = $("#select-result").empty();
                    // $(".ui-selected", this).each(function () {
                    //     var index = $("#selectable li").index(this);
                    //     if(index == 0 || index == -1 ){
                    //     }else{
                    //         result.append(" #" + ( index + 1 )); 
                    //     }                       
                    // });
                    if ($(".ui-selected").length > 1) {
                        result.append($('.ui-selected').length + " files");
                        $(".download_button").fadeIn();
                    } else if ($(".ui-selected").length == 1) {
                        var name_of_selection = $('.ui-selected').children('.list_content').children('.data_object').text();
                        result.append(name_of_selection);
                        $(".download_button").fadeIn();
                    } else if ($(".ui-selected").length == 0) {
                        $(".download_button").fadeOut();
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
        if ($scope.pagingAwareCollectionListing) {

            $scope.current_collection_index = $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.pathComponents.length - 1;
        }
        $scope.getDownloadLink = function () {
            $('.list_content').removeClass("ui-selected");
            if ($(".data_false")[0]) {
                alert("You can't download an entire collection through this web interface, please use the iRODS desktop application for bulk downloads");
            }
            $('.data_false').removeClass("ui-selected");
            var links = $('.ui-selected *');
            $log.info(links);
            links.each(function () {
                if ($(this).children('span').attr('id') != undefined) {
                    var download_path = $(this).children('span').attr('id');
                    $scope.trigger_download(download_path);
                }
                ;
            });
        };

        $scope.pop_up_open = function(){
            $('.pop_up_window').fadeIn(100);
        };
        $scope.pop_up_close = function () {
            $('.pop_up_window').fadeOut(100, function () {
                $(".upload_container").css('display', 'block');
                $(".upload_container_result").html('<ul></ul>');
                $(".upload_container_result").css('display', 'none');
                location.reload();
            });

        };
        $scope.trigger_download = function (element) {
            //return $http({method:'POST', url: $globals.backendUrl('download') + "?path=" + element, headers:});
            window.open($globals.backendUrl('download') + "?path=" + element);
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
                return $http({method: 'GET', params:params, url: globals.backendUrl('download')}).success(function (data) {
                   alert("download done!");
                }).error(function () {
                    alert("error!");
                });
            },
            downloadBundle: function (pathArray) {
                $log.info("dowloading bundle");
                if (!path) {
                    $log.error("no path provided");
                    throw "no path provided";
                }

                var params = {};

                return $http({method: 'GET', params:params, url: globals.backendUrl('download')}).success(function (data) {
                    alert("download done!");
                }).error(function () {
                    alert("error!");
                });
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

