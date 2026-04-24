// routes
app.config(function($routeProvider) {
  $routeProvider
    .when('/properties', {
      templateUrl: 'views/listing/listing.html',
      controller: 'ListingController'
    })
    .when('/properties/:id', {
      templateUrl: 'views/detail/detail.html',
      controller: 'DetailController'
    })
    .when('/favorites', {
      templateUrl: 'views/favorites/favorites.html',
      controller: 'FavoritesController'
    })
    .otherwise({
      redirectTo: '/properties'
    });
});
