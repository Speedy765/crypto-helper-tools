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
  var emas = [120, 240];
  emas.forEach(function(ema) {
    emaValue[ema] = [];
  });

  var price = [];
  var ema = [];
  var maxEma = emas[emas.length - 1]
  $rootScope.data = [];
  $rootScope.labels = [];
  $http.get('https://pm0h444dji.execute-api.eu-west-1.amazonaws.com/prod?coin=' + $rootScope.coin).
    then(handleResponse);

  function handleResponse(response) {
    if (response) {
      keys = Object.keys(response.data);
      log = response.data;
      var counter = 0;
      var emaCounter = 0;
      var emaCalculateCounter = 0;

      log.bid.forEach(function(bid, index) {
        if (counter > 60 * 12 && emaCounter > (60 * emas[1])) {
          emaCalculateCounter = 0;
          var total = 0;
          while (emaCalculateCounter < maxEma * 60){
            total += log.bid[index - (maxEma * 60 - emaCalculateCounter)];
            emaCalculateCounter++;
          }
          emaValue[emas[1]].push(total / emaCalculateCounter);
          emaCalculateCounter = 0;
          total = 0;
          while (emaCalculateCounter < emas[0] * 60){
            total += log.bid[index - (emas[0] * 60 - emaCalculateCounter)];
            emaCalculateCounter++;
          }
          emaValue[emas[0]].push(total /  emaCalculateCounter);
          price.push(bid);
          $rootScope.labels.push(index);
          counter = 0;
        }
        counter++;
        emaCounter++;
      });
      $rootScope.data = [price, emaValue[emas[0]], emaValue[emas[1]]];
    }
  }


  // setInterval(function() {
  //   $http.get('https://yh4brn8jmd.execute-api.eu-west-1.amazonaws.com/alpha1').
  //     then(handleResponse);
  // }, 5000);


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
