// status badge directive
app.directive('statusBadge', function() {
  return {
    restrict: 'E',
    scope: {
      status: '@'
    },
    templateUrl: 'components/badge/badge.html',
    link: function($scope) {
      $scope.label = '';
      $scope.cssClass = '';

      if ($scope.status === 'for-sale') {
        $scope.label = 'For Sale';
        $scope.cssClass = 'badge--for-sale';
      } else {
        if ($scope.status === 'for-rent') {
          $scope.label = 'For Rent';
          $scope.cssClass = 'badge--for-rent';
        } else {
          if ($scope.status === 'sold') {
            $scope.label = 'Sold';
            $scope.cssClass = 'badge--sold';
          } else {
            if ($scope.status === 'under-offer') {
              $scope.label = 'Under Offer';
              $scope.cssClass = 'badge--under-offer';
            } else {
              $scope.label = $scope.status;
              $scope.cssClass = '';
            }
          }
        }
      }
    }
  };
});
