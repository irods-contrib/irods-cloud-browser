'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'httpInterceptorModule',
    'MessageCenter',
    'myApp.home',
    'myApp.gallery',
    'myApp.login',
    'myApp.profile',
    'myApp.metadata',
    'globalsModule',
    'fileModule',
    'ngFileUpload'
]).


    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/home'});
    }]).config(['$httpProvider', function ($httpProvider) {
       $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.useXDomain = true;
       // delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }]);


/**
 * Global state holders
 * Created by mikeconway on 7/8/14.
 */


angular.module('globalsModule', [])

    .factory('globals', function ($rootScope) {

        var f = {};

        /*
        NB put the trailing slash in the HOST variable!
         */

        //var HOST = "https://dfcweb.datafed.org/irods-cloud-backend/";
        var HOST = "http://localhost:8080/irods-cloud-backend/";
       // var HOST = "/irods-cloud-backend/";
        f.backendUrl = function(relativeUrl) {
            return HOST + relativeUrl;
        };


        /**
         * Saved path in case an auth exception required a new login
         * @type {null}
         */
        f.lastPath = null;
        f.loggedInIdentity = null;



        /**
         * Saved path when a not authenticated occurred
         * @param newLastPath
         */
        f.setLastPath = function (newLastPath) {
            this.lastPath = newLastPath;
        };


        /**
         * Retrieve a path to re-route when a login screen was required
         * @returns {null|*|f.lastPath}
         */
        f.getLastPath = function () {
            return this.lastPath;
        };

        /**
         * Retrieve the user identity, server info, and options for the session
         * @returns {null|*}
         */
        f.getLoggedInIdentity = function() {
            return this.loggedInIdentity;
        }

        /**
         * Set the user identity, server info, and options for the session
         * @param inputIdentity
         */
        f.setLoggedInIdentity = function(inputIdentity) {
            this.loggedInIdentity = inputIdentity;
        }

        return f;

})
    .factory('breadcrumbsService', function ($rootScope, $log) {

        var bc = {};

        /**
         * Global representation of current file path for display
         */
        bc.currentAbsolutePath = null;
        bc.pathComponents = [];


        /**
         * Set the current iRODS path and split into components for use in breadcrumbs
         * @param pathIn
         */
        bc.setCurrentAbsolutePath = function (pathIn) {

            if (!pathIn) {
                this.clear();
                return;
            }

            this.currentAbsolutePath = pathIn;
            $log.info("path:" + pathIn);
            this.pathComponents = this.pathToArray(pathIn);
            $log.info("path components set:" + this.pathComponents);

        }

        /**
         * Turn a path into
         * @param pathIn
         * @returns {*}
         */
        bc.pathToArray = function (pathIn) {
            if (!pathIn) {
                $log.info("no pathin");
                return [];
            }

            var array = pathIn.split("/");
            $log.info("array orig is:" + array);
            // first element may be blank because it's the root, so it'll be trimmed from the front

            if (array.length == 0) {
                return [];
            }

            array.shift();
            return array;

        }

        /**
         * given an index into the breadcrumbs, roll back and build an absolute path based on each element in the
         * bread crumbs array
         * @param index int wiht the index in the breadcrumbs that is the last part of the selected path
         * @returns {string}
         */
        bc.buildPathUpToIndex = function (index) {

            var path = this.getWholePathComponents();

            if (!path) {
                $log.error("no path components, cannot go to breadcrumb");
                throw("cannot build path");
            }

            var totalPath = "";

            for (var i = 0; i <= index; i++) {

                // skip a blank path, which indicates an element that is a '/' for root, avoid double slashes
                if (path[i]) {

                    totalPath = totalPath + "/" + path[i];
                }
            }

            $log.info("got total path:" + totalPath);
            return totalPath;


        }

        /**
         * Get all of the path components
         * @returns {*}
         */
        bc.getWholePathComponents = function () {

            if (!this.pathComponents) {
                return [];
            } else {
                return this.pathComponents;
            }

        }


        /**
         * Reset path data
         */
        bc.clear = function () {
            this.currentAbsolutePath = null;
            this.pathComponents = [];
        }

        return bc;

    });


/**
 *
 * Defines interceptors for auth and error handling with the REST back end
 * Created by mikeconway on 3/7/14.
 *
 *
 */

angular.module('httpInterceptorModule', []).factory('myHttpResponseInterceptor', ['$q', '$location', '$log', 'MessageService', 'globals', function ($q, $location, $log, MessageService, globals) {
    return {
        // On request success
        request: function (config) {
            // console.log(config); // Contains the data about the request before it is sent.

            // Return the config or wrap it in a promise if blank.
            return config || $q.when(config);
        },

        // On request failure
        requestError: function (rejection) {
            // console.log(rejection); // Contains the data about the error on the request.

            // Return the promise rejection.
            return $q.reject(rejection);
        },

        // On response success
        response: function (response) {
            // console.log(response); // Contains the data from the response.
            $log.info(response);
            /* if (response.config.method.toUpperCase() != 'GET') {
             messageCenterService.add('success', 'Success');
             }*/

            // Return the response or promise.
            return response || $q.when(response);
        },

        // On response failture
        responseError: function (rejection) {
            // console.log(rejection); // Contains the data about the error.
            $log.error(rejection);
            var status = rejection.status;

            if (status == 401) { // unauthorized - redirect to login again
                //save last path for subsequent re-login
                if ($location.path() != "/login") {
                    $log.info("intercepted unauthorized, save the last path");
                    globals.setLastPath($location.path());
                    $log.info("saved last path:" + $location.path());
                    MessageService.warn("Please log in"); // FIXME: i18n
                }

                $location.path("/login");
            } else if (status == 400) { // validation error display errors
                //alert(JSON.stringify(rejection.data.error.message)); // here really we need to format this but just showing as alert.
                var len = rejection.data.errors.errors.length;
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        MessageService.warn(rejection.data.errors.errors[i].message);
                    }
                }

                return $q.reject(rejection);
            } else {
                // otherwise reject other status codes
                if (rejection && rejection.data) {

                    var msg = rejection.data.error;
                    if (!msg || msg == null) {
                        msg = "unknown exception occurred";  //FIXME: i18n
                    }
                    $log.error("unknown exception, message is:" + msg);
                    MessageService.error(msg);
                } else {
                    var msg = "unknown exception occurred";  //FIXME: i18n
                    $log.error("unknown exception, but with rejection, which was:" + rejection.data);
                    MessageService.error(msg);
                }
            }


            return $q.reject(rejection);
        }
        // Return the promise rejection.
        //return $q.reject(rejection);
    }

}])//Http Intercpetor to check auth failures for xhr requests
.
config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('myHttpResponseInterceptor');

    /* configure xsrf token
     see: http://stackoverflow.com/questions/14734243/rails-csrf-protection-angular-js-protect-from-forgery-makes-me-to-log-out-on
     */


}]);
/**
 * Created by mikeconway on 4/17/15.
 * File and Data Object specific services
 */

angular.module('fileModule',[])
    .factory('fileService', ['$http', '$log', '$q','globals',function ($http, $log, $q, globals) {


    var dataProfile = {};

    return {

        /**
         * retrieve a basic profile of a data object with various complex properties pre-wired
         * @param absolutePath
         */
        retrieveDataProfile: function (absolutePath) {
            $log.info("retriveDataProfile()");
            if (!absolutePath) {
                $log.error("absolutePath is missing");
                throw "absolutePath is missing";
            }

            var deferred = $q.defer();

            var promise =  $http({method: 'GET', url: globals.backendUrl('file') , params: {path: absolutePath}}).success(function(data, status, headers, config) {

                deferred.resolve(data);
                // decorate data with tag string
                $log.info("return from call to get fileBasics:" + data);
               // data.tagString = tagService.tagListToTagString(data.irodsTagValues);


            }).error(function () {
                return null;
            });

            return deferred.promise;

        },

        /**
         * Given a path, set the 'star' value to true.  This is idempotent and will silently ignore an already starred file
         * @param absolutePath String with the absolute path to the irods file or collection to be starred
         *
         * note: to call
         *
         *  // Call the async method and then do stuff with what is returned inside our own then function
         * myService.async().then(function(d) {
         *    $scope.data = d;
         *  });
         *
         *fileService.starFileOrFolder(absPath).then(function(d) {
         *    // I do cool stuff
         *  });
         *
         */

        starFileOrFolder: function(absolutePath) {
            $log.info("starFileOrFolder()");
            if (!absolutePath) {
                $log.error("absolutePath is missing");
                throw "absolutePath is missing";
            }

            var promise =  $http({method: 'PUT', url: globals.backendUrl('star') , params: {path: absolutePath}}).then(function (response) {
                // The then function here is an opportunity to modify the response
                $log.info(response);
                // The return value gets picked up by the then in the controller.
                return response.data;
            });
            // Return the promise to the controller
            return promise;
        },


        /**
         * Given a path, remove a star value.  This is idempotent and will silently ignore an already unstarred file
         * @param absolutePath  String with the absolute path to the irods file or collection to be unstarred
         * @returns {*}
         */
        unstarFileOrFolder: function(absolutePath) {
            $log.info("unstarFileOrFolder()");
            if (!absolutePath) {
                $log.error("absolutePath is missing");
                throw "absolutePath is missing";
            }

            var promise =  $http({method: 'DELETE', url: globals.backendUrl('star') , params: {path: absolutePath}}).then(function (response) {
                // The then function here is an opportunity to modify the response
                $log(response);
                // The return value gets picked up by the then in the controller.
                return response.data;
            });
            // Return the promise to the controller
            return promise;
        },

        /**
         * Move a file or folder from source to target, or move the source to the specified resource
         * @param sourcePath irodsPath to source
         * @param targetPath irodsPath to target
         * @param targetResource blank if not used, resource for target
         * @returns JSON representation of CollectionAndDataObjectListingEntry for target of copy
         */
        moveFileOrFolder: function(sourcePath, targetPath, targetResource) {
            $log.info("move()");

            if (!sourcePath) {
                $log.error("sourcePath is missing");
                throw "sourcePath is missing";
            }

            if (!targetPath) {
               targetPath = "";
            }

            if (!targetResource) {
                targetResource = "";
            }


            var promise =  $http({method: 'POST', url: globals.backendUrl('move') , params: {sourcePath: sourcePath, targetPath: targetPath, resource: targetResource}}).then(function (response) {
                // The then function here is an opportunity to modify the response
                $log(response);
                // The return value gets picked up by the then in the controller.
                return response.data; // return CollectionAndDataObjectListingEntry as JSON
            });
            // Return the promise to the controller
            return promise;

        },


        /**
         * Copy a file or folder from source to target
         * @param sourcePath irodsPath to source
         * @param targetPath irodsPath to target
         * @param targetResource blank if not used, resource for target
         * @param overwrite boolean if force is required
         * @returns JSON representation of CollectionAndDataObjectListingEntry for target of copy
         */
        copyFileOrFolder: function(sourcePath, targetPath, targetResource, overwrite) {
            $log.info("copy()");

            if (!sourcePath) {
                $log.error("sourcePath is missing");
                throw "sourcePath is missing";
            }

            if (!targetPath) {
                $log.error("targetPath is missing");
                throw "targetPath is missing";
            }

            if (!targetResource) {
               targetResource = "";
            }

            if (!overwrite) {
                overwrite = false;
            }

            var promise =  $http({method: 'POST', url: globals.backendUrl('copy') , params: {sourcePath: sourcePath, targetPath: targetPath, resource: targetResource, overwrite:overwrite}}).then(function (response) {
                // The then function here is an opportunity to modify the response
                $log(response);
                // The return value gets picked up by the then in the controller.
                return response.data; // return CollectionAndDataObjectListingEntry as JSON
            });
            // Return the promise to the controller
            return promise;

        }
    };

}]);
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
                        var result = $("#select-result").empty();
                        var copy_path_display = $("#copy_select_result").empty();
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
                            var copy_path = $('.copy_list_item.ui-selected').children('.list_content').children('.collection_object').text();
                            copy_path_display.append(copy_path);
                            $scope.copy_target = $('.copy_list_item.ui-selected').attr('id');
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
                    alert('Deletion completed');
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
                $('.copier_button').fadeOut(100);
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
            $location.url("/home/");
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


'use strict';

angular.module('myApp.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login/login.html',
    controller: 'loginCtrl'
  });
}])

.controller('loginCtrl', ['$scope', '$log', '$http', '$location', 'MessageService','globals','$q','$timeout',function ($scope, $log, $http, $location, MessageService, $globals, $q, $timeout) {
		var irodsAccount = function (host, port, zone, userName, password, authType, resource) {
		    return {
		        host: host,
		        port: port,
		        zone: zone,
		        userName: userName,
		        password: password,
		        authType: authType,
		        resource: resource

		    };
		};

        $scope.animate_ir = function () {            
            var mouse_x = event.pageX;
            var mouse_y = event.pageY;
            var elem = $('.page_center');
            var shadow_distor = Math.floor(Math.sqrt(Math.pow(mouse_x - (elem.offset().left+(elem.width()/2)), 2) + Math.pow(mouse_y - (elem.offset().top+(elem.height()/2)), 2)));
            $('.intro_screen_ir_shadow').css('width',(shadow_distor/8)+ 100 + 'px');
            $('.intro_screen_ir_shadow').css('opacity',1-(shadow_distor/700));
            $('.intro_screen_ir').css('opacity',0.3+(shadow_distor/700));
            var shadow_width = $('.intro_screen_ir_shadow').width();
            

            var icon_y = ((elem.offset().top - mouse_y)/2) - 50;
            $('.intro_screen_ir').css('top',icon_y + 'px');
            $('.intro_screen_ir_white').css('top',icon_y + 'px');
            var icon_x = ((elem.offset().left - mouse_x)/2) - 50;
            $('.intro_screen_ir').css('left',icon_x + 'px');
            $('.intro_screen_ir_white').css('left',icon_x + 'px');

            var shadow_y = (((elem.offset().top - mouse_y)*1.5)/2) - (shadow_width/2);
            $('.intro_screen_ir_shadow').css('top',shadow_y + 'px');
            var shadow_x = (((elem.offset().left - mouse_x)*1.5)/2) - (shadow_width/2);
            $('.intro_screen_ir_shadow').css('left',shadow_x + 'px');

            $log.info(icon_y +','+ shadow_distor);

        };
        $scope.close_intro = function () {
            $('.intro_screen').animate({'opacity': '0'},function(){
                $('.intro_screen').css('display','none');
            });
        };        
        $scope.submitLogin = function () {
            var actval = irodsAccount($scope.login.host, $scope.login.port, $scope.login.zone, $scope.login.userName, $scope.login.password, $scope.login.authType, "");
            
            $log.info("irodsAccount for host:" + actval);
            $http({
                method: 'POST',
                url: $globals.backendUrl('login'),
                data: actval,
                headers: { 'Content-Type': 'application/json' }  // set the headers so angular passing info as request payload
            }).then(function (data) {
                    $log.info("login successful" + data);
                    // userService.setLoggedInIdentity(data);

                    var path = $globals.getLastPath();
                    return $q.when(path);

                }).then(function(path) {

                    if (!path) {
                        $log.info("hard code to go home");
                       path="/home/home";
                    } else {
                        // setpath
                        $log.info("setting location to last path:" + path);
                    }

                    $timeout(function () {
                        $location.path(path);
                    });

                    $log.info("end login success processing");

                });
        };

}]);
'use strict';

/**
 * Module to support metadata operations
 */
angular.module('myApp.metadata', ['ngRoute'])
    .factory('metadataService', ['$http', '$log', '$q', 'globals', function ($http, $log, $q, globals) {

        return {

            /**
             * Given a path, list the AVU metadata
             * @returns {*}
             */
            listMetadataForPath: function (absolutePath) {
                $log.info("listMetadataForPath()");
                if (!absolutePath) {
                    $log.error("absolutePath is missing");
                    throw "absolutePath is missing";
                }

                var promise = $http({
                    method: 'GET',
                    url: globals.backendUrl('metadata'),
                    params: {irodsAbsolutePath: absolutePath}
                }).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    $log(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data;
                });
                // Return the promise to the controller
                return promise;
            },
            /**
             * Given a path, add the AVU metadata
             * @returns {*}
             */
            addMetadataForPath: function (absolutePath, attribute, value, unit) {
                $log.info("addMetadataForPath()");
                if (!absolutePath) {
                    $log.error("absolutePath is missing");
                    throw "absolutePath is missing";
                }

                if (!attribute) {
                    $log.error("attribute is missing");
                    throw "attribute is missing";
                }

                if (!value) {
                    Í
                    $log.error("value is missing");
                    throw "value is missing";
                }

                if (!unit) {
                    $log.error("unit is missing");
                    throw "unit is missing";
                }

                var promise = $http({
                    method: 'PUT',
                    url: globals.backendUrl('metadata'),
                    params: {irodsAbsolutePath: absolutePath, attribute: attribute, value: value, unit: unit}
                }).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    $log.info(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data;
                });
                // Return the promise to the controller
                return promise;
            },
            /**
             * Given a path, delete the AVU metadata
             * @returns {*}
             */
            deleteMetadataForPath: function (absolutePath, attribute, value, unit) {
                $log.info("deleteMetadataForPath()");
                if (!absolutePath) {
                    $log.error("absolutePath is missing");
                    throw "absolutePath is missing";
                }

                if (!attribute) {
                    $log.error("attribute is missing");
                    throw "attribute is missing";
                }

                if (!value) {
                    $log.error("value is missing");
                    throw "value is missing";
                }

                if (!unit) {
                    $log.error("unit is missing");
                    throw "unit is missing";
                }

                var promise = $http({
                    method: 'DELETE',
                    url: globals.backendUrl('metadata'),
                    params: {irodsAbsolutePath: absolutePath, attribute: attribute, value: value, unit: unit}
                }).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    $log(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data;
                });
                // Return the promise to the controller
                return promise;
            }
            ,
            /**
             * Given a path, and the current and desired AVU values, update the avu
             * @returns {*}
             */
            updateMetadataForPath: function (absolutePath, currentAttribute, currentValue, currentUnit, newAttribute, newValue, newUnit) {
                $log.info("updateMetadataForPath()");
                if (!absolutePath) {
                    $log.error("absolutePath is missing");
                    throw "absolutePath is missing";
                }


                var promise = $http({
                    method: 'POST',
                    url: globals.backendUrl('metadata'),
                    params: {irodsAbsolutePath: absolutePath,attribute:currentAttribute, value: currentValue, unit: currentUnit,newAttribute:newAttribute, newValue: newValue, newUnit: newUnit}
                }).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    $log.info(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data;
                });
                // Return the promise to the controller
                return promise;
            }


        };

    }]);


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
                        $('.q_column , .list_group_header').removeClass("ui-selected");
                        $('.q_column , .list_group_header').removeClass("ui-selectee");
                        
                        if ($("li.ui-selected").length > 1) {
                            
                        } else if ($("li.ui-selected").length == 1) {
                            
                        } else if ($("li.ui-selected").length == 0) {
                           
                        }


                    }
                });
            }         
                   
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
            fileService.starFileOrFolder(unstar_path).then(function(d) {
                $scope.dataProfile.starred = false;
            });
            //location.reload();
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
            alert($scope.old_metadata_attribute+'  '+$scope.old_metadata_value+'  '+$scope.old_metadata_unit);
        };

        $scope.delete_metadata_pop_up = function(){
            $('.pop_up_window').fadeIn(100); 
            $scope.delete_objects = $('.metadata_item.ui-selected');
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
   