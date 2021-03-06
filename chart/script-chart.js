// create the module and name it scotchApp
var bittrexApp = angular.module('bittrexApp', []);

// create the controller and inject Angular's $scope
bittrexApp.controller('mainController', function($rootScope, $http, $scope) {
  $rootScope.colors =  [ '#46BFBD', "#FF0000"];

  $rootScope.startTime = new Date().toISOString().slice(0, 19);

  $rootScope.coin = window.location.search.split("=")[1];
  var backend = "https://zurb8jn8d9.execute-api.eu-west-1.amazonaws.com/cryptotrackyv2?coin=" + $rootScope.coin.toUpperCase();
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
    if (response.data) {
      $rootScope.labels.push($rootScope.labels.length);
      document.title = $rootScope.coin + " - " + response.data.Bid;

     bid.push(response.data.Bid);
     ask.push(response.data.Ask);
	 support.push(response.data.Support);
      if (bid.length > 60 * 15) {
        bid.splice(0,1);
        ask.splice(0,1);
		support.splice(0,1);
        $rootScope.labels.splice(0,1);
      }
      $rootScope.data = [bid,ask, support];
    }
    calculateStats();
  }

   setInterval(function() {
     $http.get(backend).
       then(handleResponse);
   }, 1000);


   function calculateStats() {
     var max = bid.reduce(function(a, b) {
       return Math.max(a, b);
    });
    $rootScope.diffFromMax = calculateDiff(bid[bid.length - 1], max);
   }

   function calculateDiff(start,end) {
     return Number(((end * 100) / start - 100).toFixed(1));
  }
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

});
