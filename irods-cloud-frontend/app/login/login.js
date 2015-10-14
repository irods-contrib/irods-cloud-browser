'use strict';

angular.module('myApp.login', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'login/login.html',
            controller: 'loginCtrl',
            resolve: {

                // set vc name as selected
                configData: function (configService) {
                    var configSettings = configService.retrieveInitialConfig();
                    return configSettings;
                }
            }
        });
    }])

    .controller('loginCtrl', ['$scope', '$log', '$http', '$location', 'MessageService', 'globals', '$q', '$timeout','configData', function ($scope, $log, $http, $location, MessageService, $globals, $q, $timeout, configData) {

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

        $scope.initialConfig = configData;

        $('#main_contents').css('width', '100%');
        $scope.close_intro = function () {
            $('.intro_screen').animate({'opacity': '0'}, function () {
                $('.intro_screen').css('display', 'none');
            });
        };

        $scope.current_page = 'login';
        $scope.login = {};
        $scope.login.authType = "STANDARD";
        $scope.submitLogin = function () {
            
            if($scope.initialConfig.loginPresetEnabled === true){
                if($scope.initialConfig.presetPort == ''){
                    var port = $scope.login.port;
                }else{
                    var port = $scope.initialConfig.presetPort;
                }

                if($scope.initialConfig.presetZone == ''){
                    var zone = $scope.login.zone;
                }else{
                    var zone = $scope.initialConfig.presetZone;
                }

                if($scope.initialConfig.presetHost == ''){
                    var host = $scope.login.host;
                }else{
                    var host = $scope.initialConfig.presetHost;
                }

                if($scope.initialConfig.presetAuthScheme == ''){
                    var AuthScheme = $scope.login.authType;
                }else{
                    var AuthScheme = $scope.initialConfig.presetAuthScheme;
                }
                var actval = irodsAccount(host, port, zone, $scope.login.userName, $scope.login.password, AuthScheme, "");
            }else{
                var actval = irodsAccount($scope.login.host, $scope.login.port, $scope.login.zone, $scope.login.userName, $scope.login.password, $scope.login.authType, "");
            }
            $http({
                method: 'POST',
                url: $globals.backendUrl('login/'),
                data: actval
            }).then(function (data) {
                $log.info("login successful" + data);

                var path = $globals.getLastPath();
                return $q.when(path);

            }).then(function (path) {

                if (!path) {
                    $log.info("hard code to go home");
                    path = "/home/My Home";
                } else {
                    // setpath
                    $log.info("setting location to last path:" + path);
                }

                // $timeout(function () {
                $location.path(path);
                // });

                $log.info("end login success processing");

            });
        };

    }]).factory('configService', ['$http', '$log', '$q', 'globals', function ($http, $log, $q, globals) {

        /**
         * Service to handle configuration information
         */
        return {

            retrieveInitialConfig: function() {
                $log.info("retrieveInitialConfig()");

               var promise = $http({
                    method: 'GET',
                    url: globals.backendUrl('initialConf'),
                    params: {}
                }).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    $log.info(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data;
                });
                // Return the promise to the controller
                return promise;
            }


        }
    }]);