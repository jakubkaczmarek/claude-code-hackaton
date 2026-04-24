// detail controller
app.controller('DetailController', function($scope, $routeParams, PropertyService, AgentService, FavoritesService) {

  $scope.property = null;
  $scope.agent = null;
  $scope.related = [];
  $scope.loading = true;
  $scope.activeImage = '';
  $scope.isFav = false;
  $scope.mapUrl = '';

  var propId = $routeParams.id;

  PropertyService.getById(propId).then(function(data) {
    $scope.property = data;
    $scope.loading = false;

    if ($scope.property.images) {
      if ($scope.property.images.length > 0) {
        $scope.activeImage = $scope.property.images[0];
      }
    }

    $scope.isFav = FavoritesService.isFavorite($scope.property.id);

    // format price display
    $scope.priceDisplay = '';
    if ($scope.property.priceType === 'monthly') {
      $scope.priceDisplay = '$' + $scope.property.price.toLocaleString() + ' / month';
    } else {
      if ($scope.property.priceType === 'weekly') {
        $scope.priceDisplay = '$' + $scope.property.price.toLocaleString() + ' / week';
      } else {
        $scope.priceDisplay = '$' + $scope.property.price.toLocaleString();
      }
    }

    // build map embed url
    if ($scope.property.coordinates) {
      $scope.mapUrl = 'https://maps.google.com/maps?q=' + $scope.property.coordinates.lat + ',' + $scope.property.coordinates.lng + '&z=15&output=embed';
    }

    // load agent
    AgentService.getById($scope.property.agentId).then(function(agentData) {
      $scope.agent = agentData;
      console.log('agent loaded', $scope.agent);
    });

    // related properties - same location or type
    PropertyService.getAll().then(function(allProps) {
      var temp = [];
      for (var i = 0; i < allProps.length; i++) {
        if (allProps[i].id !== $scope.property.id) {
          if (allProps[i].location === $scope.property.location || allProps[i].type === $scope.property.type) {
            temp.push(allProps[i]);
          }
        }
      }
      // just take first 3
      $scope.related = [];
      for (var j = 0; j < temp.length; j++) {
        if ($scope.related.length < 3) {
          $scope.related.push(temp[j]);
        }
      }
      console.log('related', $scope.related.length);
    });

  });

  $scope.setActiveImage = function(imgUrl) {
    $scope.activeImage = imgUrl;
  };

  $scope.toggleFav = function() {
    FavoritesService.toggle($scope.property.id);
    $scope.isFav = FavoritesService.isFavorite($scope.property.id);
  };

  $scope.getFullAddress = function() {
    if ($scope.property) {
      if ($scope.property.address) {
        return $scope.property.address.street + ', ' + $scope.property.address.suburb + ', ' + $scope.property.address.city + ' ' + $scope.property.address.state + ' ' + $scope.property.address.postcode;
      }
    }
    return '';
  };

});
