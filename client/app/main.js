'use strict';

// Declare app level module which depends on views, and components
angular.module('dealblender', [
  'ngRoute'
])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.otherwise({redirectTo: '/'});

  $locationProvider.html5Mode(true);
}]);

console.log('Welcome to Yeogurt!');