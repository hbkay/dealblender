'use strict';

angular.module('dealblender')
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/app/home/home.html',
        controller: 'HomeCtrl',
        resolve: {
          sources: getAll
        }
      });
  });

function getAll (sourcesFactory) {
  return sourcesFactory.getAll();
}