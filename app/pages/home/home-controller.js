angular.module('cryptotracky').controller('HomeCtrl', function ($rootScope, $scope, $state, $location) {
  $rootScope.state = $state.$current.name;
});
