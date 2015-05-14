'use strict';

angular.module('dealblender')
  .controller('HomeCtrl', function($scope, deals) {
    // console.log(deals);
    $scope.deals = deals.data;
  });
