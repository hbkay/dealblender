'use strict';

angular.module('dealblender')
  .directive('deal', function($compile, $http, $templateCache) {
    // return {
    //   templateUrl: '/app/deal/deal.html',
    //   restrict: 'E',
    // };
  var getTemplate = function (site) {
    var templateLoader,
    baseUrl = '/app/deal/',
    templateMap = {
        // woot: 'dealWoot.html',
        // SlickDeals: 'dealSlickDeals.html',
        // DealNews: 'dealDealNews.html',
        // Fatwallet: 'dealFatwallet.html',
    };
    
    var templateFile = (templateMap[site] ? templateMap[site] : 'deal.html')

    var templateUrl = baseUrl + templateFile;
    templateLoader = $http.get(templateUrl, {cache: $templateCache});
  
    return templateLoader;
  }
  var linker = function (scope, element, attrs) {
    var site = scope.content.site;
    var loader = getTemplate(site);
  
    var promise = loader.success(function(html) {
        element.html(html);
    }).then(function (response) {
        element.replaceWith($compile(element.html())(scope));
    });
  }
  
  return {
    restrict: "E",
    link: linker,
    scope: {
        content:'='
    },
  };

  });
