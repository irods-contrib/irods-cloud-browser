'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
    'httpInterceptorModule', // look in components for http interceptor that will trap errors and auth processing
  'myApp.view1',
  'myApp.view2',
  'myApp.login',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
