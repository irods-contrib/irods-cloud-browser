/**
 * Global state holders
 * Created by mikeconway on 7/8/14.
 */


angular.module('globalsModule', [])

    .factory('globals',['$rootScope', '$log', '$location', '$injector', function ($rootScope, $log, $location,  $injector) {

        
        var f = {};
        /*
         NB put the trailing slash in the HOST variable!
         */
        // var HOST = "/irods-cloud-backend/";
        var HOST = "http://"+location.hostname+":8080/irods-cloud-backend/";
        //var HOST = "http://dfc-test-tomcat1.edc.renci.org:8080/irods-cloud-backend/";
        //var HOST = "http://dfc-ui-test.renci.org:8080/irods-cloud-backend/";
        f.backendUrl = function (relativeUrl) {

            var myUrl = HOST + relativeUrl;
            $log.info("computed URL:" + myUrl);
            return myUrl;
        };
        /* ||||||||||||||||||||||||||||||||||| */
        /* ||||||||  SIDE NAV ACTIONS  ||||||| */
        /* ||||||||||||||||||||||||||||||||||| */

        $rootScope.selectDashboardView = function () {
            $log.info("going to Dashboard View");
            $location.url("/dashboard/");
        };
        $rootScope.selectHierView = function () {
            $log.info("going to Hierarchical View");
            $location.url("/home");
        };
        $rootScope.selectSearchView = function (query_name) {
          if (!query_name){
            var query_id = uuid.v1();
            $log.info("going to Dashboard View");            
            $location.url("/search/?query_id="+query_id);
          }else{
            $log.info("going to Dashboard View");            
            $location.url("/search/?query_id="+query_name);
          }
            
        };
        $rootScope.get_query_params = function (query_name){
            return $http({
                    method: 'GET',
                    url: $globals.backendUrl('metadataQuery'),
                    params: {uniqueName:query_name}
                }).success(function (data) {
                    $scope.query_vc = data;
                    var param_string = $scope.query_vc.queryString;
                    $scope.query_params =  JSON.parse(param_string);
                    $scope.search_objs = "BOTH";
                })
        }
        var side_nav_toggled = "yes";
        $rootScope.side_nav_toggle = function () {

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
        $rootScope.side_nav_autotoggle = function (auto_toggle) {

            if (auto_toggle == 'off') {
                if (side_nav_toggled == "no") {
                    toggle_on = setTimeout($rootScope.side_nav_toggle, 1000);
                }
            } else if (auto_toggle == 'on') {
                clearTimeout(toggle_on);
            }
        };
        

        /* ||||||||||||||||||||||||||||||||||| */
        /* ||||||||||| LOGOUT FUNC. |||||||||| */
        /* ||||||||||||||||||||||||||||||||||| */

        $rootScope.logout_func = function () {
            var $http;
            if (!$http) { $http = $injector.get('$http'); }
            return $http({
                method: 'POST',
                url: f.backendUrl('logout')
            }).then(function () {
                // The then function here is an opportunity to modify the response
                // The return value gets picked up by the then in the controller.
                //setTimeout(function () {
                    $location.path("/login").search({});
                //}, 0);
            });
        };

        /* ||||||||||||||||||||||||||||||||||| */
        /* |||||| BROWSER ACTION TRIGGER ||||| */
        /* ||||||||||||||||||||||||||||||||||| */

        var userAgent = navigator.userAgent.toLowerCase(); 
         if (userAgent .indexOf('safari')!=-1){ 
           if(userAgent .indexOf('chrome')  > -1){
             //browser is chrome
           }else{
            //browser is safari, add css
           }
          }

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
        f.getLoggedInIdentity = function () {
            return this.loggedInIdentity;
        }

        /**
         * Set the user identity, server info, and options for the session
         * @param inputIdentity
         */
        f.setLoggedInIdentity = function (inputIdentity) {
            this.loggedInIdentity = inputIdentity;
        }

        /**
         * Method to URL encode column names
         * @param collName
         * @returns {url encoded collName}
         */
        f.sanitizeCollName = function (collName) {

            if (!collName) {
                throw "no collName provided";
            }

            return encodeURIComponent(collName);

        }


        /**
         * Cause a logout to occur, and reposition at the login screen
         
        f.logout = function () {

            var promise = $http({
                method: 'DELETE',
                url: globals.backendUrl('login/')
            }).then(function (response) {
                // The then function here is an opportunity to modify the response
                $log(response);
                // The return value gets picked up by the then in the controller.
                return response.data;
            });
            // Return the promise to the controller
            return promise;
        }*/

        return f;
    }])
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

