// create the module and name it scotchApp
var bittrexApp = angular.module('bittrexApp', []);

// create the controller and inject Angular's $scope
bittrexApp.controller('mainController', function($rootScope, $http, $scope) {
	
	var defaultMinVolume = 50;								//Minimum volume for coinTableMain
	var defaultIntervals = [2,4,8,16,32,64,128,256,512];	//Interval for interval list
	
	//Use localstorage for debuging
	var debug = false;
	
	//Default sort on coinTableMain
	$rootScope.orderByField = 'coin';
	$rootScope.reverseSort =  false;
	
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
		if (debug && localStorage["testjes"] && (tempResponce == [] || !keepOldData)){
			tempResponce = {
				data: JSON.parse(localStorage["testjes"])
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
		$scope.inputIntervals = intervals.join(",");
		$rootScope.intervals = intervals;
		backend = "http://34.240.107.131:1338/min?intervals=" + intervals.join(",");
		$rootScope.firstInterval = Math.min.apply(null, intervals);
		$rootScope.headers = intervals;
		
		$scope.inputMinVolume = minVolume;
		
	}
	
	$rootScope.updateSettings = function(){
		//Fill variables with form data
		intervals = $scope.inputIntervals.split(",").map(Number).filter(Boolean);
		minVolume = parseInt($scope.inputMinVolume);
		
		//Reinitalize variables
		initSettings();
		
		//Pull new data from the internet
		updateData();
	}
	
	$rootScope.saveSettings = function(){
		//Save variables to localstorage
		localStorage["intervalsLong"] = $scope.inputIntervals.split(",").map(Number).filter(Boolean);
		localStorage["minVolumeLong"] = parseInt($scope.inputMinVolume);
		localStorage["settingsSavedLong"] = true;
		
		//Pull new data from the internet
		$rootScope.updateSettings();
		
	}
	
	$rootScope.loadSettings = function(){
		//If settings are saved, then load them from localstorage
		//Else reset to defaults
		if (localStorage["settingsSavedLong"]){
			intervals = localStorage["intervalsLong"].split(",");
			minVolume = parseInt(localStorage["minVolumeLong"]);
			initSettings();
		}else{
			$rootScope.resetSettings();
		}
		
		//Pull new data from the internet
		$rootScope.updateSettings();
	}	
	
	$rootScope.resetSettings = function(){
		//Reset variables to default and initialize them
		intervals = defaultIntervals;
		minVolume = defaultMinVolume;

		initSettings();
		
		//Pull new data from the internet
		$rootScope.updateSettings();
	}
	
	
	//Run loadSettings once to fill the settings panel
	$rootScope.loadSettings();
	
	var lastItems;
	var coins = {};
	var coin, startPrice, currentPrice, startVolume, currentVolume, hide;
	var keys;

	var tops = {};
		
	function handleResponse(response, keepOldData) {
		if (response.data && response.data.ETH.log.length) {
			//Fill tempResponce for updating without retrieving
			tempResponce = {data: response.data}; 
			
			//If debug and no local data stored jet, then save
			if (debug && !localStorage["testjes"]){
				localStorage["testjes"] = JSON.stringify(tempResponce.data);
			}
			
			//Fill / Update the ingnoreList in the rootScope for display on page
			$rootScope.ignoreListLong = localStorage["ignoreListLong"];
			
			var coins = Object.keys(response.data);
			$rootScope.finalList = [];
			var coinData;
			coins.forEach(function(key) {
				if (ignoreListLong.indexOf(key) == -1){
					coinData = response.data[key];
					
					if(coinData.volume.toFixed(0) > minVolume){ 
						$rootScope.finalList.push({
							coin: coinData.coin,
							current: coinData.current.toFixed(8),
							volume: Number(coinData.volume.toFixed(0)),
							high: coinData.high.toFixed(8),
							low: coinData.low.toFixed(8),
							log: coinData.log.map(function(x){
								x = Number(x);
								if(isNaN(x)){
									x=-9999;
								};
								return x;
							}),
						});
					};
				}
			});
		}
	}
	
	//Start the code and load new data
	updateData();
	
	//Update the data with new data in x msec
	setInterval(function() {
		updateData();
	}, 60000);


});

bittrexApp.directive('coinTableMain', function() {
  return {
    templateUrl: "table-directive.html"
  };
});
bittrexApp.directive('longPanelSettings', function() {
  return {
    templateUrl: "panel-long-settings.html"
  };
});