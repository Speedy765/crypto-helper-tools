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

  var orderLog = [];
  $rootScope.orderLabels = [];
  $http.get(backendLog).
    then(handleOrderResponse);

  function handleOrderResponse(response) {
    if (response.data && response.data.success) {
      var items = response.data.result;
      orderLog = [];
      $rootScope.orderLabels = [];
      console.debug(items[0].TimeStamp);
      items.forEach(function(item) {
        if (item.Total > 0.01) {
          if (item.OrderType === "BUY") {
            orderLog.push(item.Total);
            $rootScope.orderLabels.push("");
          }
          else if (item.OrderType === "SELL") {
            orderLog.push(0 - item.Total);
            $rootScope.orderLabels.push("");
          }
        }
      });
      if (orderLog.length > 60) {
        orderLog.splice(0,1);
        $rootScope.orderLabels.splice(0,1);
      }
      $rootScope.orderData = [orderLog];
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
    type: "bar",
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
