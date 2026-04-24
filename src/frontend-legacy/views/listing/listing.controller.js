// listing controller
app.controller('ListingController', function($scope, PropertyService, FilterService, FavoritesService) {

  $scope.allProperties = [];
  $scope.properties = [];
  $scope.loading = true;
  $scope.totalCount = 0;
  $scope.filters = FilterService.getFilters();

  // load properties
  PropertyService.getAll().then(function(data) {
    $scope.allProperties = data;
    $scope.totalCount = data.length;
    $scope.properties = FilterService.apply($scope.allProperties);
    $scope.loading = false;
    console.log('listing loaded', $scope.allProperties.length, 'properties');
  });

  // when filters change re-apply
  $scope.$on('filtersChanged', function() {
    $scope.properties = FilterService.apply($scope.allProperties);
    console.log('filters changed, showing', $scope.properties.length);
  });

  $scope.sortKey = FilterService.getFilters().sortKey;

  $scope.changeSort = function() {
    FilterService.setFilter('sortKey', $scope.sortKey);
  };

  $scope.clearFilters = function() {
    FilterService.resetFilters();
    $scope.sortKey = 'newest';
  };

  $scope.favCount = FavoritesService.getCount();

});
