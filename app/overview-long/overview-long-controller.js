cryptotracky.controller('overviewLongController', function($state, $rootScope, $http, $scope, localStorageService, ChartService) {

	var state = $state.$current.name.split("-");
	var exchange = "bittrex";
	if (state[2]) {
		exchange = state[2];
	}

	$scope.activeState = exchange;
	var localStorageKey = "overviewSettings-long";
	var overviewSettings = localStorageService.get(localStorageKey);
	if (!overviewSettings) {
		localStorageService.set(localStorageKey,
			{
				minVolume : 50,
				maxItemsInterval : 5,
				intervals : "30,60,90,120,150,180,210,240,270,300",
			}
		);
		overviewSettings = localStorageService.get(localStorageKey);
	}

	//Default sort on coinTableMain
	$rootScope.orderByField = 'coin';
	$rootScope.reverseSort =  false;
	$rootScope.selectedSort = "price";
	$rootScope.activeMarket = "btc";

	//Functions for coin ignores are next
	var ignoreListLong = [];
	if (localStorage["ignoreListLong"] === undefined) {
		//ignoreListLong = undefined;
	}
	else {
		ignoreListLong = localStorage["ignoreListLong"].split(",");
	}

	$rootScope.ignore = function(key) {
		ignoreListLong.push(key);
		localStorage.setItem("ignoreListLong", ignoreListLong.join(","));

		//update data without loading new data
		updateData(true);
	};

	$rootScope.resetHide = function(){
		localStorage.removeItem("ignoreListLong");
		ignoreListLong = [];

		//update data without loading new data
		updateData(true);
	}

	//Function for updating data
	var tempResponse = [];
	function updateData(keepOldData){
		if(tempResponse == [] || !keepOldData){
			backend = "https://overview-long.cryptotracky.com/min-" + exchange + "&intervals=" + $scope.inputIntervals;
			// backend = "http://localhost:1336/min?market=" + $rootScope.activeMarket + "&intervals=" + $scope.inputIntervals;
			$http.get(backend).
			then(handleResponse);

		}else{
			handleResponse(tempResponse, keepOldData);
		}
	}

	//Initalize variables
	$scope.inputIntervals = overviewSettings.intervals.split(",");

	$rootScope.firstInterval = Math.min.apply(null, $scope.inputIntervals);
	$rootScope.headers = $scope.inputIntervals;

	$scope.inputMinVolume = overviewSettings.minVolume;



	var lastItems;
	var coins = {};
	var coin, startPrice, currentPrice, startVolume, currentVolume, hide;
	var keys;

	var tops = {};

	function createExchangeLinkForCoin(coin) {
		if (exchange === "bittrex") {
			return "https://bittrex.com/Market/Index?MarketName=BTC-" + coin;
		}
		else if (exchange === "binance") {
			return "https://www.binance.com/tradeDetail.html?symbol=" + coin + "_BTC";
		}
		else if (exchange === "cryptopia") {
			return "https://www.cryptopia.co.nz/Exchange?market=" + coin + "_BTC";
		}
		else if (exchange === "kucoin") {
			return "https://www.kucoin.com/#/trade.pro/" + coin + "-BTC";
		}
		else if (exchange === "huobi") {
			return "https://www.huobipro.com/" + coin + "_btc/exchange/";
		}
	}

	function handleResponse(response, keepOldData) {
		overviewSettings = localStorageService.get(localStorageKey);
		$scope.inputIntervals = overviewSettings.intervals.split(",");
		$rootScope.firstInterval = Math.min.apply(null, $scope.inputIntervals);
		$rootScope.headers = $scope.inputIntervals;
		$scope.inputMinVolume = overviewSettings.minVolume;
		if (response.data) {
			//Fill tempResponse for updating without retrieving
			tempResponse = {data: response.data};

			//Fill / Update the ingnoreList in the rootScope for display on page
			$rootScope.ignoreListLong = localStorage["ignoreListLong"];

			var coins = Object.keys(response.data);
			$rootScope.finalList = [];
			var coinData;
			var currentPrice;
			coins.forEach(function(key) {
				if (ignoreListLong.indexOf(key) == -1){
					coinData = response.data[key];

					if(coinData.volume.toFixed(0) > parseInt(overviewSettings.minVolume)){
						$rootScope.finalList.push({
							coin: coinData.coin,
							link: createExchangeLinkForCoin(coinData.coin),
							current: coinData.current.toFixed(8),
							volume: Number(coinData.volume.toFixed(0)),
							high: coinData.high.toFixed(8),
							low: coinData.low.toFixed(8),
							priceLog: coinData.log.map(function(x){
								x = Number(x);
								if(isNaN(x)){
									x=-9999;
								};
								return x;
							}),
							volumeLog: coinData.volumeLog,
							chart: ChartService.getSvgForCoin(coinData)
						});
					};
				}
			});
		}
	}

	$scope.marketUpdate = function(newMarket) {
		$rootScope.activeMarket = newMarket;
		updateData();
	}

	$scope.sortUpdate = function() {
		setTimeout(function() {
			updateData();
		},0)
	}

	$rootScope.$on("settingsUpdate", function() {
		updateData(true);
	});

	//Start the code and load new data
	updateData();

	// Update the data with new data in x msec
	var updateInterval = setInterval(function() {
		updateData();
	}, 1000 * 60);

	$scope.$on("$destroy", function() {
		clearInterval(updateInterval);
	});


});
