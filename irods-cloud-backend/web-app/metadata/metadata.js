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
                    
                    $log.error("value is missing");
                    throw "value is missing";
                }

                if (!unit) {
                    unit = "";
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

                var promise = $http({
                    method: 'DELETE',
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

