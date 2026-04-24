// property card directive
app.directive('propertyCard', function(FavoritesService) {
  return {
    restrict: 'E',
    scope: {
      property: '='
    },
    templateUrl: 'components/property-card/property-card.html',
    link: function($scope) {

      $scope.isFav = FavoritesService.isFavorite($scope.property.id);

      $scope.toggleFav = function() {
        FavoritesService.toggle($scope.property.id);
        $scope.isFav = FavoritesService.isFavorite($scope.property.id);
      };

      // format price
      $scope.priceDisplay = '';
      if ($scope.property.priceType === 'monthly') {
        $scope.priceDisplay = '$' + $scope.property.price.toLocaleString() + '/mo';
      } else {
        if ($scope.property.priceType === 'weekly') {
          $scope.priceDisplay = '$' + $scope.property.price.toLocaleString() + '/wk';
        } else {
          $scope.priceDisplay = '$' + $scope.property.price.toLocaleString();
        }
      }

      $scope.thumbImg = '';
      if ($scope.property.images) {
        if ($scope.property.images.length > 0) {
          $scope.thumbImg = $scope.property.images[0];
        }
      }

      $scope.addressLine = $scope.property.address.suburb + ', ' + $scope.property.address.city;

    }
  };
});
