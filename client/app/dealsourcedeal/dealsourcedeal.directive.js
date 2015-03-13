'use strict';

angular.module('dealblender')
  .directive('dealSourceDeal', function() {
    return {
      templateUrl: "\\app\\dealsourcedeal\\dealsourcedeal.html",
      restrict: 'E',
      controller: dealSourceDealCtrl,
      controllerAs: 'vm',
      bindToController: true,
    };
  });


function dealSourceDealCtrl ($scope) {
  var vm = this;

  vm.deal = $scope.deal;

  console.log(vm);
  console.log($scope);
}