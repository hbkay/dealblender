'use strict';

angular.module('dealblender')
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/app/home/home.html',
        controller: 'HomeCtrl'
      });
  });
