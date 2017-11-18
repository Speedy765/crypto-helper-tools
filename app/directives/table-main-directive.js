cryptotracky.directive('coinTableMain', function() {
  return {
    templateUrl: "directives/table-main.html",
		link: function($scope) {
			$scope.log = function(coin) {
				if (window.amplitude) {
					amplitude.getInstance().logEvent("Open bittrex", coin);
				}
			}
			$scope.logRealtime = function(coin) {
				if (window.amplitude) {
					amplitude.getInstance().logEvent("Open realtime", coin);
				}
			}
		}
  };
});
