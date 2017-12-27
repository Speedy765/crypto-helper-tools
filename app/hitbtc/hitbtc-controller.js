cryptotracky.controller('hitBtcController', function($rootScope, $http, $scope, localStorageService) {

	function updateData() {
		backend = "https://45l2ubr8w4.execute-api.eu-west-1.amazonaws.com/beta";
		$http.get(backend).
		then(handleResponse);
	}


	function handleResponse(response) {
		$rootScope.markets = response.data.body;
	}

	// Start the code and load new data
	updateData();

	//Update the data with new data in x msec
	var updateInterval = setInterval(function() {
		updateData();
	}, 1000 * 60);

	$scope.$on("$destroy", function() {
		clearInterval(updateInterval);
	});


});
