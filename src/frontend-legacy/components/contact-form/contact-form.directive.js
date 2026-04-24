// contact form directive
app.directive('contactForm', function() {
  return {
    restrict: 'E',
    scope: {
      agent: '='
    },
    templateUrl: 'components/contact-form/contact-form.html',
    link: function($scope) {

      $scope.formData = {
        name: '',
        email: '',
        phone: '',
        message: '',
        preferredContact: 'email',
        viewingDate: ''
      };

      $scope.submitted = false;
      $scope.showSuccess = false;
      $scope.showErrors = false;

      $scope.submitForm = function() {
        $scope.submitted = true;

        if ($scope.contactForm.$valid) {
          console.log('contact form submitted', $scope.formData);
          console.log('agent', $scope.agent);
          $scope.showSuccess = true;
          $scope.showErrors = false;
        } else {
          $scope.showErrors = true;
        }
      };

    }
  };
});
