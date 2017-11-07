// create the module and name it scotchApp
var bittrexApp = angular.module('bittrexApp', []);

// create the controller and inject Angular's $scope
bittrexApp.controller('mainController', function($rootScope, $http, $scope) {

	var defaultMinVolumeMain = 50;							//Minimum volume for coinTableMain
	var defaultMinVolumeInterval = 50;						//Minimum volume for coinTableInterval (can be <= minVolumeMain)
	var defaultMaxItemsInterval = 5;						//Number of items per interval
	var defaultTopIntervals = [1,5,15,30, 60, 240];			//Interval for interval list

	var logUpdateInterval = 10; 							//Every x seconds there is a log item

	$rootScope.startTime = new Date().toISOString().slice(0, 19);

	//Use localstorage for debuging
	var debug = false;

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


	$rootScope.toggleSettingsPanel = function(){
		if(!$rootScope.showSettingsPanel){
			$rootScope.showSettingsPanel = true; //Assume it's not clicked if there's no existing value
		}else{
			$rootScope.showSettingsPanel = false;
		}
	};

	//Function for updating data
	var tempResponce = [];
	function updateData(keepOldData){
		if (debug && localStorage["testjes-overview"] && (tempResponce == [] || !keepOldData)){
			tempResponce = {
				data: JSON.parse(localStorage["testjes-overview"])
			};
			handleResponse(tempResponce);

		}else if(tempResponce == [] || !keepOldData){
			$http.get(backend).
			then(handleResponse);

		}else{
			handleResponse(tempResponce, keepOldData);
		}
	}

	//Functions for settings are next
	function initSettings(){
		//Initalize variables
		$scope.inputIntervals = topIntervals.join(",");
		$rootScope.intervals = topIntervals;
		backend = "http://cryptotracky-overview-608466767.eu-west-1.elb.amazonaws.com/"
		$rootScope.firstInterval = Math.min.apply(null, topIntervals);

		$scope.inputMinVolumeInterval = minVolumeInterval;
		$scope.inputMaxItemsInterval = maxItemsInterval;

		$scope.inputMinVolumeMain = minVolumeMain;

	}

	$rootScope.updateSettings = function(){
		//Fill variables with form data
		topIntervals = $scope.inputIntervals.split(",").map(Number).filter(Boolean);
		minVolumeInterval = parseInt($scope.inputMinVolumeInterval);
		maxItemsInterval = parseInt($scope.inputMaxItemsInterval);

		minVolumeMain = parseInt($scope.inputMinVolumeMain);

		//Reinitalize variables
		initSettings();

		//update data without loading new data
		updateData(true);

	}
	$rootScope.saveSettings = function(){
		//Save variables to localstorage
		localStorage["topIntervals"] = $scope.inputIntervals.split(",").map(Number).filter(Boolean);
		localStorage["minVolumeInterval"] = parseInt($scope.inputMinVolumeInterval);
		localStorage["maxItemsInterval"] = parseInt($scope.inputMaxItemsInterval);
		localStorage["minVolumeMain"] = parseInt($scope.inputMinVolumeMain);
		localStorage["settingsSaved"] = true;

		//Run an update
		$rootScope.updateSettings();

	}

	$rootScope.loadSettings = function(){
		//If settings are saved, then load them from localstorage
		//Else reset to defaults
		if (localStorage["settingsSaved"]){
			topIntervals = localStorage["topIntervals"].split(",");
			minVolumeInterval = parseInt(localStorage["minVolumeInterval"]);
			maxItemsInterval = parseInt(localStorage["maxItemsInterval"]);
			minVolumeMain = parseInt(localStorage["minVolumeMain"]);
			initSettings();
		}else{
			$rootScope.resetSettings();
		}

		//update data without loading new data
		updateData(true);

	}

	$rootScope.resetSettings = function(){
		//Reset variables to default and initialize them
		topIntervals = defaultTopIntervals;
		minVolumeInterval = defaultMinVolumeInterval;
		maxItemsInterval = defaultMaxItemsInterval;
		minVolumeMain = defaultMinVolumeMain;

		initSettings();

		//update data without loading new data
		updateData(true);

	}


	//Run loadSettings once to fill the settings panel
	$rootScope.loadSettings();

	var lastItems;
	var coins = {};
	var coin, startPrice, currentPrice, startVolume, currentVolume, hide;
	var keys;

	var tops = {};

	// clean $rootScope.finalList = [];

	function handleResponse(response, keepOldData) {
		if (response.data && response.data.success) {
			//Fill tempResponce for updating without retrieving
			tempResponce = {data: response.data
			};

			//If debug and no local data stored jet, then save
			if (debug && !localStorage["testjes-overview"]){
				localStorage["testjes-overview"] = JSON.stringify(tempResponce.data);
			}

			if (!keepOldData){
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
						if (coins[key].priceLog.length > itemsPerLogInterval) {
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

	//Start the code and load new data
	updateData();


	//Update the data with new data in x msec
	setInterval(function() {
		updateData();

		//refresh screen
		if(debug){
			$scope.$apply();
		}
	}, 10000);



});

bittrexApp.directive('coinTableMain', function() {
  return {
    templateUrl: "table-directive.html",
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
