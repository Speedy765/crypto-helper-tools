// create the module and name it scotchApp
var bittrexApp = angular.module('bittrexApp', []);

// create the controller and inject Angular's $scope
bittrexApp.controller('mainController', function($rootScope, $http, $scope) {

	var intervals = [2,4,8,16,32,64, 128, 256, 512];	//Interval for interval list

	$rootScope.headers = intervals;
	
	//Use localstorage for debuging
	var debug = false;
	
	//Default sort on coinTableMain
	$rootScope.orderByField = 'coin';
	$rootScope.reverseSort =  false;
	
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


	//If debug is true, then chech if data is stored in localstorage
	//If needed store data in localStorage
	//Then run the code with the localy stored data
	//
	//If debug is false, then use online data
	if (debug){
		var response1 = '';
		if (localStorage["testjes"] === undefined) {
			//Get data online and store this localy befor running the rest of the code
			$http.get(backend).then(function(x){
				response1 = {data: x.data};
				localStorage["testjes"] = JSON.stringify(x.data);
				handleResponse(response1);
			});
			
		}else{
			//Data is already localy, so run with this data
			response1 = {
				data: JSON.parse(localStorage["testjes"])
			};
			handleResponse(response1);
		};
		
	} else {
		//Get data online
		$http.get(backend).
			then(handleResponse);
	}
	
	function handleResponse(response) {
		if (response.data && response.data.ETH.log.length) {
			var coins = Object.keys(response.data);
			$rootScope.finalList = [];
			var coinData;
			coins.forEach(function(key) {
				coinData = response.data[key];
				$rootScope.finalList.push({
					coin: coinData.coin,
					current: coinData.current.toFixed(8),
					high: coinData.high.toFixed(8),
					low: coinData.low.toFixed(8),
					log: coinData.log.map(Number),
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
