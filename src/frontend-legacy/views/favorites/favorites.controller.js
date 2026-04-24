// favorites controller
app.controller('FavoritesController', function($scope, PropertyService, FavoritesService) {

  $scope.properties = [];
  $scope.loading = true;
  $scope.isEmpty = false;

  var favIds = FavoritesService.getIds();
  console.log('fav ids', favIds);

  PropertyService.getAll().then(function(data) {
    $scope.loading = false;

    if (favIds.length === 0) {
      $scope.isEmpty = true;
    } else {
      var result = [];
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < favIds.length; j++) {
          if (data[i].id === favIds[j]) {
            result.push(data[i]);
          }
        }
      }
      $scope.properties = result;

      if ($scope.properties.length === 0) {
        $scope.isEmpty = true;
      }
    }
    console.log('fav properties', $scope.properties);
  });

});
