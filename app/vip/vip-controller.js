angular.module('cryptotracky').controller('VipCtrl', function ($scope, $location, cognitoService) {

  $scope.vipActive = true;

  // cognitoService.isVipActive().then(function() {
  //   $scope.vipActive = true;
  // }, function() {
  //   $scope.vipActive = false;
  // })
});
