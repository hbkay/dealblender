'use strict';

angular.module('dealblender')
  .controller('HomeCtrl', function($scope, sources) {
    $scope.sources = sources.data;

  });
