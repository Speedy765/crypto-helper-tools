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

	var backend = "http://34.240.107.131:1337/min"
	var lastItems;
	var coins = {};
	var coin, startPrice, currentPrice, startVolume, currentVolume, hide;
	var keys;

	$rootScope.intervals = intervals;
	var tops = {};



	$http.get(backend).
		then(handleResponse);

	function handleResponse(response) {
		if (response.data && response.data.ETH.bid.length) {
			var coins = Object.keys(response.data);
			// console.debug(coins);
			var coinLog, coinIntervalLog, lastPrice, high, low;
			$rootScope.finalList = [];
			coins.forEach(function(key) {
				coinIntervalLog = [];
				coinLog = response.data[key].bid;
				lastPrice = coinLog[coinLog.length - 1];
				high = 0;
				low = 100000000000;
				coinLog.forEach(function(logPrice) {
					if (logPrice > high) {
						high = logPrice;
					}
					if (logPrice < low) {
						low = logPrice;
					}
				})
				intervals.forEach(function(interval) {
					//diffSinceStart: Number(((currentPrice * 100) / startPrice - 100).toFixed(1)),
					// coinIntervalLog.push(coinLog[coinLog.length - interval]);
					coinIntervalLog.push(Number((lastPrice * 100) / coinLog[coinLog.length - interval] - 100).toFixed(1));
				})
				// console.debug(coinIntervalLog);
				$rootScope.finalList.push({
					coin: key,
					log : coinIntervalLog,
					current: lastPrice,
					high: high,
					low: low
				});
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
