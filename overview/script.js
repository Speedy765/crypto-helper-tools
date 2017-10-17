// create the module and name it scotchApp
var bittrexApp = angular.module('bittrexApp', []);

// create the controller and inject Angular's $scope
bittrexApp.controller('mainController', function($rootScope, $http, $scope) {

  var ignoreList = [];
  var volumeMainLimit = 50; //coinTableMain
  var volumeIntervalLimit = 50; //coinTableInterval (mustbe => volumeMainLimit)
  var enableignoreList = false; //enable/disable ignore function

  $rootScope.startTime = new Date().toISOString().slice(0, 19);

  //Default sort on coinTableMain
  $rootScope.orderByField = 'volumeDiff';
  $rootScope.reverseSort =  true;

  if (localStorage["ignoreList"] === undefined) {
  }
  else {
    ignoreList = localStorage["ignoreList"].split(",");
  }

  $rootScope.ignore = function(key) {
    ignoreList.push(key);
    localStorage.setItem("ignoreList", ignoreList.join(","));
  };

  var backend = "http://34.240.107.131:1339"
  var lastItems;
  var coins = {};
  var coin, startPrice, currentPrice, startVolume, currentVolume, hide;
  var keys;
  var topIntervals = [1,5,15,30, 60, 240];
  var updateInterval = 10;
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


      lastItems = lastItems.filter(function(item) {
		if (enableignoreList == true) {
			return ignoreList.indexOf(item.MarketName.replace("BTC-", "")) == -1;
		}
		else {
			return true;
		};
      });

      lastItems = lastItems.filter(function(item) {
        return item.BaseVolume > volumeMainLimit;
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

      keys.forEach(function(key) {
        currentPrice = coins[key].priceLog[coins[key].priceLog.length - 1];
        startPrice = coins[key].priceLog[0];
        currentVolume = coins[key].volumeLog[coins[key].volumeLog.length - 1];
        startVolume = coins[key].volumeLog[0];

			$rootScope.finalList.push({
			  coin: key,
			  start: startPrice,
			  price: currentPrice,
			  volume: Number(currentVolume),
			  diffSinceStart: Number(((currentPrice * 100) / startPrice - 100).toFixed(1)),
			  volumeDiff: Number(((currentVolume * 100) / startVolume - 100).toFixed(1)),
			});

			topIntervals.forEach(function(top) {
			  if (coins[key].priceLog.length > (top * 60) / updateInterval ) {
				startPrice = coins[key].priceLog[coins[key].priceLog.length - (top * 60) / updateInterval];
				startVolume = coins[key].volumeLog[coins[key].volumeLog.length - (top * 60) / updateInterval];

				if (coins[key].volumeLog[coins[key].volumeLog.length - 1] > volumeIntervalLimit) {
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
          $rootScope.tops[top] = tops[top].slice(0,5);
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
