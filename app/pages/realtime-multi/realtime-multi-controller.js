cryptotracky.controller('realtimeMultiController', function($rootScope, $http, $scope, $stateParams) {

  $rootScope.coins = $stateParams.coins.split(",");

});
