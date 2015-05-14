'use strict';

angular.module('dealblender')
  .factory('dealsFactory', function($http) {
    return {
      getDeals: function() {
        var url = '/deals';
        var promise = $http.get(url);

        return promise;
      }
    };
  });
