// create the module and name it scotchApp
var bittrexApp = angular.module('bittrexApp', ['chart.js']);

// create the controller and inject Angular's $scope
bittrexApp.controller('mainController', function($rootScope, $http, $scope) {
  $rootScope.colors =  [ '#46BFBD', "#FF0000"];

  $rootScope.startTime = new Date().toISOString().slice(0, 19);

  $rootScope.coin = window.location.search.split("=")[1];
  var backend = "https://t209sklv38.execute-api.eu-west-1.amazonaws.com/v1?type=both&market=BTC-" + $rootScope.coin.toUpperCase();
  document.title = $rootScope.coin + "price";
  $rootScope.finalList = [];
  $rootScope.labels = [];
  $rootScope.data = [];
  var bid = [];
  var ask = [];
  var support = [];
  $http.get(backend).
    then(handleResponse);

  function handleResponse(response) {
    if (response.data && response.data.success) {
      items = response.data.result
      $rootScope.labels.push($rootScope.labels.length);
      document.title = $rootScope.coin + " - " + items.buy[0].Rate;
      bid.push(items.buy[0].Rate);
      ask.push(items.sell[0].Rate);
      var coinPrice = items.buy[0].Rate;
      var amountBought = 0.5 / coinPrice;
      var buyQuantity = 0;
      items.buy.every(function(buyOrder) {
        buyQuantity += buyOrder.Quantity;
        if (buyQuantity >= amountBought) {
          support.push(buyOrder.Rate)
          return false;
        }
        return true;

      });
      if (bid.length > 60 * 15) {
        bid.splice(0,1);
        ask.splice(0,1);
        support.
        $rootScope.labels.splice(0,1);
      }
      $rootScope.data = [bid,ask, support];
    }
  }

  setInterval(function() {
    $http.get(backend).
      then(handleResponse);
  }, 1000);


  var backendLog = "https://x64bepwna0.execute-api.eu-west-1.amazonaws.com/v1?market=BTC-" + $rootScope.coin.toUpperCase();

  var buys = [];
  var sells = [];
  $rootScope.orderLabels = [];
  $http.get(backendLog).
    then(handleOrderResponse);

  function handleOrderResponse(response) {
    if (response.data && response.data.success) {
      var items = response.data.result;
      buys.push(0);
      sells.push(0);
      var t1 = new Date();
      t1.setHours(t1.getHours() - 2);
      var t2;

      items.every(function(item) {
        t2 = new Date(item.TimeStamp);
        var dif = t1.getTime() - t2.getTime();

        var Seconds_from_T1_to_T2 = dif / 1000;
        var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
        if (Seconds_Between_Dates < 60) {
          if (item.OrderType === "BUY") {
            buys[buys.length - 1] += item.Total;
          }
          else if (item.OrderType === "SELL") {
            sells[sells.length - 1] += item.Total;
          }
          return true;
        }
        else {
          return false;
        }
      });
      $rootScope.orderLabels.push(buys.length);
      if (buys.length > 60) {
        buys.splice(0,1);
        sells.splice(0,1);
        $rootScope.orderLabels.splice(0,1);
      }
      console.debug("sell" + sells[sells.length - 1]);
      $rootScope.orderData = [buys, sells];
    }
  }

  setInterval(function() {
    $http.get(backendLog).
      then(handleOrderResponse);
  }, 1000);


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
    },
    options : {
      label: ["test", "test2"]
    },
    label: ["test", "test2"]
  };

  $rootScope.orderOptions = {
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
    },
    showLine: [false]
  };

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
