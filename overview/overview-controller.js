cryptotracky.controller('overviewController', function($rootScope, $http, $scope, localStorageService) {

	document.title = "Overview | Crypto Tracky";

	var overviewSettings = localStorageService.get("overviewSettings");
	if (!overviewSettings) {
		localStorageService.set("overviewSettings",
			{
				minVolume : 50,
				maxItemsInterval : 5,
				intervals : "1,5,15,30, 60, 240",
			}
		);
		overviewSettings = localStorageService.get("overviewSettings");
	}
	overviewSettings.intervals = overviewSettings.intervals.split(",");
	$scope.intervals = overviewSettings.intervals;
	var logUpdateInterval = 10; 							//Every x seconds there is a log item

	//Use localstorage for debuging
	var debug = false;
	var backend = "http://cryptotracky-overview-608466767.eu-west-1.elb.amazonaws.com/";
	//Default sort on coinTableMain
	$rootScope.orderByField = 'volumeDiff';
	$rootScope.reverseSort =  true;

	//Functions for coin ignores are next
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

		//update data without loading new data
		updateData(true);
	};

	$rootScope.resetHide = function(){
		localStorage.removeItem("ignoreList");
		ignoreList = [];

		//update data without loading new data
		updateData(true);
	}

	//Function for updating data
	var tempResponse = [];
	function updateData(keepOldData){
		if (debug && localStorage["testjes-overview"] && (tempResponse == [] || !keepOldData)){
			tempResponse = {
				data: JSON.parse(localStorage["testjes-overview"])
			};
			handleResponse(tempResponse);

		}else if(tempResponse == [] || !keepOldData){
			$http.get(backend).
			then(handleResponse);

		}else{
			handleResponse(tempResponse, keepOldData);
		}
	}


	var lastItems;
	var coins = {};
	var coin, startPrice, currentPrice, startVolume, currentVolume, hide;
	var keys;

	var tops = {};

	// clean $rootScope.finalList = [];

	function handleResponse(response, keepOldData) {
		if (response.data && response.data.success) {
			//Fill tempResponse for updating without retrieving
			tempResponse = {data: response.data};

			overviewSettings = localStorageService.get("overviewSettings")
			overviewSettings.intervals = overviewSettings.intervals.split(",");
			$scope.intervals = overviewSettings.intervals;

			//If debug and no local data stored jet, then save
			if (debug && !localStorage["testjes-overview"]){
				localStorage["testjes-overview"] = JSON.stringify(tempResponse.data);
			}

			if (!keepOldData){
				lastItems = response.data.result.filter(function(item) {
					return item.MarketName.indexOf("BTC-") > -1;
				});

				overviewSettings.intervals.forEach(function(top) {
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
			}

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

					if (currentVolume > parseInt(overviewSettings.minVolume)) {
						$rootScope.finalList.push({
							coin: key,
							start: startPrice,
							price: currentPrice,
							volume: Number(currentVolume),
							diffSinceStart: Number(((currentPrice * 100) / startPrice - 100).toFixed(1)),
							volumeDiff: Number(((currentVolume * 100) / startVolume - 100).toFixed(1)),
						});
					}

					overviewSettings.intervals.forEach(function(top) {
						//Calculate the number of items before next interval is hit
						var itemsPerLogInterval = (top * 60) / logUpdateInterval;

						//Number of items is larger the amount per log interval and so the interval can be displayed
						if (coins[key].priceLog.length > itemsPerLogInterval) {
							startPrice = coins[key].priceLog[coins[key].priceLog.length - itemsPerLogInterval];
							startVolume = coins[key].volumeLog[coins[key].volumeLog.length - itemsPerLogInterval];

							if (currentVolume > overviewSettings.minVolume) {
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
			overviewSettings.intervals.forEach(function(top) {
				if (tops[top].length) {
					tops[top].sort(function(a, b) {
						return b.diffSinceStart - a.diffSinceStart;
					});
					$rootScope.tops[top] = tops[top].slice(0,overviewSettings.maxItemsInterval);
				}
			});
		}

	}

	//Start the code and load new data
	updateData();


	//Update the data with new data in x msec
	var updateInterval = setInterval(function() {
		updateData();

		//refresh screen
		if(debug){
			$scope.$apply();
		}
	}, 10000);

	$scope.$on("$destroy", function() {
		clearInterval(updateInterval);
	});

	if (window.ga) {
		ga('send', 'pageview');
	}
});
