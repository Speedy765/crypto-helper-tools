cryptotracky.directive('overviewPanelSettings', function(localStorageService) {
  return {
    templateUrl: "directives/settings.html",
    scope: {
      settingsType : "="
    },
    link: function($scope) {
      var keyToUse = "overviewSettings";
      if ($scope.settingsType !== "short") {
        keyToUse += "-" + $scope.settingsType;
      }
      $scope.resetSettings = function(){
        localStorageService.set(keyToUse,
          {
            minVolume : 50,
            maxItemsInterval : 5,
            intervals : "1,5,15,30, 60, 240",
          }
        );
      }

      $scope.saveSettings = function(){
        localStorageService.set(keyToUse,$scope.overviewSettings);
      }

      $scope.overviewSettings = localStorageService.get(keyToUse);
      if (!$scope.overviewSettings) {
        $scope.resetSettings();
        $scope.overviewSettings = localStorageService.get(keyToUse);
      }

    }
  };
});
