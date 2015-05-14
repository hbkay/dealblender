'use strict';

angular.module('dealblender')
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/app/home/home.html',
        controller: 'HomeCtrl',
        resolve: {
          deals: getDeals
        }
      });
  });

function getDeals (dealsFactory) {
  return dealsFactory.getDeals();
}