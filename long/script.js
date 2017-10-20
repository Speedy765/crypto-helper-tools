// create the module and name it scotchApp
var bittrexApp = angular.module('bittrexApp', []);

// create the controller and inject Angular's $scope
bittrexApp.controller('mainController', function($rootScope, $http, $scope) {

	var intervals = [2,4,8,16,32,64, 128, 256, 512];	//Interval for interval list

	$rootScope.headers = intervals;
	//Default sort on coinTableMain
	$rootScope.orderByField = 'volumeDiff';
	$rootScope.reverseSort =  true;

	var ignoreList = [];
	if (localStorage["ignoreList"] === undefined) {
		//ignoreList = undefined;
	}
	else {
		ignoreList = localStorage["ignoreList"].split(",");
	}

	$rootScope.ignore = function(key) {
		ignoreList.push(key);
		localStorage.setItem("ignoreList", ignoreList.join(","));
	};

	$rootScope.resetHide = function(){
		localStorage.removeItem("ignoreList");
		ignoreList = [];
	}

	var backend = "http://34.240.107.131:1337/min?intervals=" + intervals.join(",");
	var lastItems;
	var coins = {};
	var coin, startPrice, currentPrice, startVolume, currentVolume, hide;
	var keys;

	$rootScope.intervals = intervals;
	var tops = {};



	$http.get(backend).
		then(handleResponse);

	function handleResponse(response) {
		if (response.data && response.data.ETH.log.length) {
			var coins = Object.keys(response.data);
			$rootScope.finalList = [];
			var coinData;
			coins.forEach(function(key) {
				coinData = response.data[key];
				$rootScope.finalList.push(coinData);
			});
		}
	}

	setInterval(function() {
		$http.get(backend).
			then(handleResponse);
	}, 60000);


});

bittrexApp.directive('coinTableMain', function() {
  return {
    templateUrl: "table-directive.html"
  };
});
