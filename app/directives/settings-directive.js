cryptotracky.directive('overviewPanelSettings', function($rootScope, localStorageService) {
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
      $scope.overviewSettings = localStorageService.get(keyToUse);
      $scope.resetSettings = function(){
        localStorageService.set(keyToUse,
          {
            minVolume : 50,
            maxItemsInterval : 5,
            intervals : $scope.settingsType === "long" ? "30,60,90,120,150,180,210,240,270,300" : "1,5,15,30, 60, 240",
          }
        );
        $scope.overviewSettings = localStorageService.get(keyToUse);
        window.location.reload();
      }

      $scope.saveSettings = function(){
        localStorageService.set(keyToUse,$scope.overviewSettings);
        $rootScope.$emit("settingsUpdate", ["data"]);
        window.location.reload();
      }

      if (!$scope.overviewSettings) {
        $scope.resetSettings();
        $scope.overviewSettings = localStorageService.get(keyToUse);
      }

    }
  };
});
