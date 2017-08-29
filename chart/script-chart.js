// create the module and name it scotchApp
var bittrexApp = angular.module('bittrexApp', ['chart.js']);

// create the controller and inject Angular's $scope
bittrexApp.controller('mainController', function($rootScope, $http, $scope) {


  $rootScope.startTime = new Date().toISOString().slice(0, 19);

  $rootScope.coin = window.location.search.split("=")[1];
  var backend = "https://0pz86m8uxc.execute-api.eu-west-1.amazonaws.com/v1?market=BTC-" + $rootScope.coin.toUpperCase();
  document.title = $rootScope.coin + "price";
  $rootScope.finalList = [];
  $rootScope.labels = [];
  $rootScope.data = [];
  var bid = [];
  var ask = [];
  $http.get(backend).
    then(handleResponse);

  function handleResponse(response) {
    if (response.data && response.data.success) {
      item = response.data.result
      $rootScope.labels.push($rootScope.labels.length);
      document.title = $rootScope.coin + " - " + item.Bid;
      bid.push(item.Bid);
      ask.push(item.Ask);
      if ($rootScope.data.length > 60 * 30) {
        bid.splice(0,1);
        ask.splice(0,1);
        $rootScope.labels.splice(0,1);
      }
      $rootScope.data = [bid, ask];
    }
  }

  setInterval(function() {
    $http.get(backend).
      then(handleResponse);
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
    }
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
