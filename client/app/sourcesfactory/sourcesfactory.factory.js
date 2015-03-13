'use strict';

angular.module('dealblender')
  .factory('sourcesFactory', function($http) {
    // Public API
    return {
      getAll: function() {
        var url = '/sources';
        var promise = $http.get(url);

        return promise;
      }
    };
  });
