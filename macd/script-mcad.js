// create the module and name it scotchApp
var bittrexApp = angular.module('bittrexApp', ['chart.js']);

// create the controller and inject Angular's $scope
bittrexApp.controller('mainController', function($rootScope, $http, $scope) {

  var ignoreList = [];
  var volumeLimit = 50;

  $rootScope.startTime = new Date().toISOString().slice(0, 19);
  $rootScope.coin = window.location.search.split("=")[1];
  if (localStorage["ignoreList"] === undefined) {
  }
  else {
    ignoreList = localStorage["ignoreList"].split(",");
  }

  $rootScope.ignore = function(key) {
    ignoreList.push(key);
    localStorage.setItem("ignoreList", ignoreList.join(","));
  };

  var lastItems;
  var coins = {};
  var coin, startPrice, currentPrice, startVolume, currentVolume;
  var keys;
  var tops = {};
  var log = {};
  var emaValue = {};
  var emas = [12, 26];
  emas.forEach(function(ema) {
    emaValue[ema] = [];
  });

  var price = [], histogram = [];
  var ema = [];
  var maxEma = emas[emas.length - 1]
  $rootScope.data = [];
  $rootScope.labels = [];
  $http.get('http://localhost:1555/macd/' + $rootScope.coin).
    then(handleResponse);

  function handleResponse(response) {
    if (response) {

      keys = Object.keys(response.data);
      var dataLength = response.data.bid.length;
      var counter = 0;
      var emaCounter = 0;
      var emaCalculateCounter = 0;
      price = [];
      histogram = [];
      $rootScope.labels = [];
      response.data.bid.forEach(function(bid, index) {
        // if (index > dataLength * 0.75) {
            price.push(bid);
            $rootScope.labels.push(index);
        // }
      });

      response.data.macd.forEach(function(item, index) {
        // if (index > dataLength * 0.75) {

            histogram.push(item.histogram);
        // }
      });
      // $rootScope.data = [price, emaValue[emas[0]], emaValue[emas[1]]];
      $rootScope.data = price;
      $rootScope.histogram = histogram;
    }
  }


  setInterval(function() {
    $http.get('http://localhost:1555/macd/' + $rootScope.coin).
      then(handleResponse);
  }, 10000);


  $rootScope.options = {
    type: "line",
    animation : {
      duration : 0
    },
    responsiveAnimationDuration : 0,
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'right'
        }
      ]
    }
  };

});
