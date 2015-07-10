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
    }]);

