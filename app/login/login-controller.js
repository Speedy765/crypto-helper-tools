angular.module('cryptotracky').controller('LoginCtrl', function ($scope, $location, cognitoService) {

  $scope.submit = function () {
    var userPool = cognitoService.getUserPool();

    var cognitoUser = cognitoService.getUser(userPool, $('#email').val());
    var authenticationDetails = cognitoService.getAuthenticationDetails($('#email').val(), $('#password').val());

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        var accessToken = result.getAccessToken().getJwtToken();
        $scope.accessToken = accessToken;

        var currentUser = userPool.getCurrentUser();

        $location.path('/vip');
        $scope.$apply();
      },
      onFailure: function (err) {
        $scope.errorMessage = err.message;
        $scope.$apply();
      },

    });
  };

  return false;

});
