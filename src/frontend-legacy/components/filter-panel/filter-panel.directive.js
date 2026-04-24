// filter panel directive
app.directive('filterPanel', function(FilterService, $http) {
  return {
    restrict: 'E',
    templateUrl: 'components/filter-panel/filter-panel.html',
    link: function($scope) {

      $scope.filters = FilterService.getFilters();
      $scope.locations = [];

      // load locations for dropdown
      $http.get('/api/locations').then(function(response) {
        $scope.locations = response.data;
        console.log('locations', $scope.locations);
      });

      $scope.updateFilter = function(key, value) {
        FilterService.setFilter(key, value);
      };

      $scope.clearAll = function() {
        FilterService.resetFilters();
        $scope.filters = FilterService.getFilters();
      };

      $scope.bedroomOptions = [
        { label: 'Any', value: '' },
        { label: '1+', value: '1' },
        { label: '2+', value: '2' },
        { label: '3+', value: '3' },
        { label: '4+', value: '4' },
        { label: '5+', value: '5' }
      ];

    }
  };
});
