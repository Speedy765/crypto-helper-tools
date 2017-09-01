// create the module and name it scotchApp
var bittrexApp = angular.module('bittrexApp', []);

// create the controller and inject Angular's $scope
bittrexApp.controller('mainController', function($rootScope, $http, $scope) {

  var ignoreList = [];
  var volumeLimit = 50;

  $rootScope.startTime = new Date().toISOString().slice(0, 19);

  if (localStorage["ignoreList"] === undefined) {
  }
  else {
    ignoreList = localStorage["ignoreList"].split(",");
  }

  $rootScope.ignore = function(key) {
    ignoreList.push(key);
    localStorage.setItem("ignoreList", ignoreList.join(","));
  };

  var backend = "https://yh4brn8jmd.execute-api.eu-west-1.amazonaws.com/temp"
  var lastItems;
  var coins = {};
  var coin, startPrice, currentPrice, startVolume, currentVolume;
  var keys;
  var topIntervals = [1,5,15,30, 60, 240];
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
        return ignoreList.indexOf(item.MarketName.replace("BTC-", "")) === -1;
      });

      lastItems = lastItems.filter(function(item) {
        return item.BaseVolume > volumeLimit;
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
        coins[coin].priceLog.push(item.Last.toFixed(8));
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
          volume: coins[key].volumeLog[coins[key].volumeLog.length - 1],
          diffSinceStart: Number(((currentPrice * 100) / startPrice - 100).toFixed(1)),
          volumeDiff: Number(((currentVolume * 100) / startVolume - 100).toFixed(1))
        });
        topIntervals.forEach(function(top) {
          if (coins[key].priceLog.length > (top * 60) / 5 ) {
            currentPrice = coins[key].priceLog[coins[key].priceLog.length - 1];
            startPrice = coins[key].priceLog[coins[key].priceLog.length - (top * 60) / 5];
            currentVolume = coins[key].volumeLog[coins[key].volumeLog.length - 1];

            startVolume = coins[key].volumeLog[coins[key].volumeLog.length - (top * 60) / 5];
            if (coins[key].volumeLog[coins[key].volumeLog.length - 1] > 50) {
              tops[top].push({
                coin: key,
                start: startPrice,
                price: currentPrice,
                volume: coins[key].volumeLog[coins[key].volumeLog.length - 1],
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
  }, 5000);

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
