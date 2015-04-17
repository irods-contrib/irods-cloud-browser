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

            var promise =  $http({method: 'GET', url: globals.backendUrl('file/') , params: {path: absolutePath}}).success(function(data, status, headers, config) {

                deferred.resolve(data);
                // decorate data with tag string
                $log.info("return from call to get fileBasics:" + data);
               // data.tagString = tagService.tagListToTagString(data.irodsTagValues);


            }).error(function () {
                return null;
            });

            return deferred.promise;

        }




    };

}]);