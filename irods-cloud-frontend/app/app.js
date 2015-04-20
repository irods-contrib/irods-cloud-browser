'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
    'httpInterceptorModule',
     'MessageCenter',// look in components for http interceptor that will trap errors and auth processing
  'myApp.home',
  'myApp.login',
  'myApp.profile',
  'globalsModule',
  'myApp.version',
    'fileModule'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/home'});
}]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
}]);

