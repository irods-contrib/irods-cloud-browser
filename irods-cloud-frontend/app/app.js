'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
    'httpInterceptorModule',
     'MessageCenter',
  'myApp.home',
  'myApp.login',
  'myApp.profile',
  'globalsModule',
  'myApp.version',
    'fileModule',
    'ngFileUpload'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/home'});
}]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
}]);

