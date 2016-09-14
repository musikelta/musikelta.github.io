(function(){
  var app = angular.module("musikelta", ['ngAnimate', 'ui.router'],function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
  });
  app.directive("player", Player);
  app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/");
  $stateProvider
    .state('home', {
      url: "/",
      templateUrl: "/home.html"
    })
    .state('blog', {
      url: "/blog",
      templateUrl: "/blog.html"
    })
    .state('post', {
      url: "/blog/post/:url",
      templateProvider: ['$templateFactory','$stateParams', '$http', function($templateFactory, $stateParams, $http) {
          var url = "/post/"+$stateParams.url;
          return $templateFactory.fromUrl(url);
      }]
    })
    .state('about', {
      url: "/about",
      templateUrl: "/about.html"
    })
    .state('events', {
      url: "/events",
      templateUrl: "/events.html"
    })
    .state('impressum', {
      url: "/impressum",
      templateUrl: "/impressum.html"
    })
    .state('videos', {
      url: "/videos",
      templateUrl: "/videos.html"
    });
  });
})();
