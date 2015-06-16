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
                console.log(response);
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
                console.log(response);
                // The return value gets picked up by the then in the controller.
                return response.data;
            });
            // Return the promise to the controller
            return promise;
        }
    };

}]);