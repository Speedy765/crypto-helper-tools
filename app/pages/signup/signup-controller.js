angular.module('cryptotracky').controller('SignupCtrl', function ($scope, $location, cognitoService) {

  $scope.submit = function ($event) {
    $event.preventDefault();
    var userPool = cognitoService.getUserPool();
    var nameParam = {
      Name: 'name',
      Value: $('#name').val()
    };

    var emailParam = {
      Name: 'email',
      Value: $('#email').val()
    };

    var attributes = cognitoService.getUserAttributes(nameParam, emailParam);

    userPool.signUp($('#name').val(), $('#password').val(), attributes, null, function (err, result) {
      if (err) {
        console.log(err);

        $scope.errorMessage = err.message;
        $scope.$apply();
        return;
      } else {
        console.log(result);

        $location.path('/vip');
        $scope.$apply();
      }
    });

    return false;
  }

});
