cryptotracky.controller('realtimeController', function($rootScope, $http, $scope, $stateParams) {

  $rootScope.colors =  [ '#46BFBD', "#FF0000"];

  $rootScope.coin = $stateParams.coin;
  var backend = "http://realtimeNoSupport-919050512.eu-west-1.elb.amazonaws.com/realtimeChart?coin=" + $rootScope.coin.toUpperCase();
  document.title = $rootScope.coin + "price";
  $rootScope.finalList = [];
  $rootScope.labels = [];
  $rootScope.data = [];
  var bid = [];
  var ask = [];
  $http.get(backend).
    then(handleResponse);

  function handleResponse(response) {
    if (response.data && response.data.result) {
      var result = response.data.result;
      $rootScope.labels.push($rootScope.labels.length);
      document.title = $rootScope.coin + " - " + result.Bid;

     bid.push(result.Bid);
     ask.push(result.Ask);
     if (bid.length > 60 * 15) {
        bid.splice(0,1);
        ask.splice(0,1);
        $rootScope.labels.splice(0,1);
      }
      $rootScope.data = [bid,ask];
    }
    calculateStats();
  }

   updateInterval = setInterval(function() {
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

	$scope.$on("$destroy", function() {
		clearInterval(updateInterval);
	});

  if (window.ga) {
		ga('send', 'pageview', "realtimeController");
	}
});
