cryptotracky.directive('overviewPanelSettings', function(localStorageService) {
  return {
    templateUrl: "directives/settings.html",
    link: function($scope) {

      $scope.resetSettings = function(){
        localStorageService.set("overviewSettings",
          {
            minVolume : 50,
            maxItemsInterval : 5,
            intervals : [1,5,15,30, 60, 240],
          }
        );
      }

      $scope.saveSettings = function(){
        localStorageService.set("overviewSettings",$scope.overviewSettings);
      }

      $scope.overviewSettings = localStorageService.get("overviewSettings");
      if (!$scope.overviewSettings) {
        $scope.resetSettings();
        $scope.overviewSettings = localStorageService.get("overviewSettings");
      }

    }
  };
});
