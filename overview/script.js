// create the module and name it scotchApp
var bittrexApp = angular.module('bittrexApp', []);

// create the controller and inject Angular's $scope
bittrexApp.controller('mainController', function($rootScope, $http, $scope) {

	var minVolumeMain = 50;							//Minimum volume for coinTableMain
	var minVolumeInterval = 50;						//Minimum volume for coinTableInterval (can be <= minVolumeMain)
	var maxItemsInterval = 5;						//Number of items per interval
	var topIntervals = [1,5,15,30, 60, 240];	//Interval for interval list
	
	var logUpdateInterval = 10; 					//Every x seconds there is a log item

	$rootScope.startTime = new Date().toISOString().slice(0, 19);

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
	
	$rootScope.toggleSettingsPanel = function(){
		if(!$rootScope.showSettingsPanel){
			$rootScope.showSettingsPanel = true; //Assume it's not clicked if there's no existing value
		}else{
			$rootScope.showSettingsPanel = false;
		}
	};
	
	$rootScope.ignore = function(key) {
		ignoreList.push(key);
		localStorage.setItem("ignoreList", ignoreList.join(","));
	};

	$rootScope.resetHide = function(){
		localStorage.removeItem("ignoreList");
		ignoreList = [];
	}
	
	var backend = "http://cryptotracky-overview-608466767.eu-west-1.elb.amazonaws.com/"
	var lastItems;
	var coins = {};
	var coin, startPrice, currentPrice, startVolume, currentVolume, hide;
	var keys;
	
	$rootScope.intervals = topIntervals;
	var tops = {};

	$rootScope.finalList = [];
	
	$http.get(backend).
		then(handleResponse);

	function handleResponse(response) {
		if (response.data && response.data.success) {
			lastItems = response.data.result.filter(function(item) {
				return item.MarketName.indexOf("BTC-") > -1;
			});

			topIntervals.forEach(function(top) {
				tops[top] = [];
			});
			
			lastItems.forEach(function(item) {
				coin = item.MarketName.replace("BTC-", "");
				if (!coins[coin]) {
					coins[coin] = {
						priceLog : [],
						volumeLog : []
					};
				}
				coins[coin].priceLog.push(item.Bid.toFixed(8));
				coins[coin].volumeLog.push(item.BaseVolume.toFixed(0));
				
			});
			
			keys = Object.keys(coins);
			$rootScope.finalList = [];
			
			//Fill / Update the ingnoreList in the rootScope for display on page
			$rootScope.ignoreList = localStorage["ignoreList"];
			
			//Cycle through the coins
			keys.forEach(function(key) {
				if (ignoreList.indexOf(key) == -1){
					//Coin NOT in ignore list
					currentPrice = coins[key].priceLog[coins[key].priceLog.length - 1];
					startPrice = coins[key].priceLog[0];
					currentVolume = coins[key].volumeLog[coins[key].volumeLog.length - 1];
					startVolume = coins[key].volumeLog[0];
					
					if (currentVolume > minVolumeMain) {
						$rootScope.finalList.push({
							coin: key,
							start: startPrice,
							price: currentPrice,
							volume: Number(currentVolume),
							diffSinceStart: Number(((currentPrice * 100) / startPrice - 100).toFixed(1)),
							volumeDiff: Number(((currentVolume * 100) / startVolume - 100).toFixed(1)),
						});
					}
					
					topIntervals.forEach(function(top) {
						//Calculate the number of items before next interval is hit
						var itemsPerLogInterval = (top * 60) / logUpdateInterval;
						
						//Number of items is larger the amount per log interval and so the interval can be displayed
						//if (coins[key].priceLog.length > (top * 60) / logUpdateInterval ) {
						if (coins[key].priceLog.length > itemsPerLogInterval) {
							var test1 = coins[key].priceLog.length;
							var test2 = top * 60;
							startPrice = coins[key].priceLog[coins[key].priceLog.length - itemsPerLogInterval];
							startVolume = coins[key].volumeLog[coins[key].volumeLog.length - itemsPerLogInterval];
							
							if (currentVolume > minVolumeInterval) {
								tops[top].push({
									coin: key,
									start: startPrice,
									price: currentPrice,
									volume: Number(currentVolume),
									diffSinceStart: Number(((currentPrice * 100) / startPrice - 100).toFixed(1)),
									volumeDiff: Number(((currentVolume * 100) / startVolume - 100).toFixed(1))
								})
							}
						};
					});
				}else{
					//Coin in ignore list
				}
			});
			$rootScope.finalList.sort(function(a, b) {
				return b.diffSinceStart - a.diffSinceStart;
			});
			
			$rootScope.tops = {};
			topIntervals.forEach(function(top) {
				if (tops[top].length) {
					tops[top].sort(function(a, b) {
						return b.diffSinceStart - a.diffSinceStart;
					});
					$rootScope.tops[top] = tops[top].slice(0,maxItemsInterval);
				}
			});
		}
	}

	setInterval(function() {
		$http.get(backend).
			then(handleResponse);
	}, 10000);


});

bittrexApp.directive('coinTableMain', function() {
  return {
    templateUrl: "table-directive.html"
  };
});


bittrexApp.directive('coinTableInterval', function() {
  return {
    templateUrl: "table-interval.html"
  };
});

bittrexApp.directive('overviewPanelSettings', function() {
  return {
    templateUrl: "panel-overview-settings.html"
  };
});

