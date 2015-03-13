'use strict';

angular.module('dealblender')
  .directive('dealSource', function() {
    return {
      templateUrl: "\\app\\dealsource\\dealsource.html",
      restrict: 'E',
      controller: dealSourceCtrl,
      controllerAs: 'vm',
      bindToController: true,
    };
  });


function dealSourceCtrl ($scope) {
  var vm = this;
  vm.src = $scope.src

  console.log(vm);
  console.log($scope);
}