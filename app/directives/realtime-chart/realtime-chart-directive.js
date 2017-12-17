cryptotracky.directive('realtimeChart', function($http) {
  return {
    templateUrl: "directives/realtime-chart/realtime-chart.html",
    scope: {
      coin : "="
    },
    link : function($scope, element) {
      console.debug($scope);
      $scope.colors =  [ '#46BFBD', "#FF0000"];
      if ($scope.coin.indexOf("-") === -1) {
        $scope.coin = "BTC-" + $scope.coin;
      }

      $scope.coin = $scope.coin.toUpperCase();

      var coin = $scope.coin;

      var backend = "http://realtimeNoSupport-919050512.eu-west-1.elb.amazonaws.com/realtimeChart?coin=" + coin;
      $scope.finalList = [];
      $scope.labels = [];
      $scope.data = [];
      var bid = [];
      var ask = [];
      $http.get(backend).
        then(handleResponse);

      function handleResponse(response) {
        if (response.data && response.data.result) {
          var result = response.data.result;
          bid.push(result.Bid);
          ask.push(result.Ask);
          if (bid.length > 60 * 15) {
            bid.splice(0,1);
            ask.splice(0,1);
          }
          $scope.data = [bid,ask];
          $scope.labels = [];
          var dataLength = bid.length;
          var j = bid.length;

          while (j !== 0) {
            $scope.labels.push("");
            j--;
          }

          j = 1;
          // while (j < dataLength / 60) {
             // $scope.labels.splice(0 - (j * 60),0, "-" + j + "min");
          //    j++;
          // }
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
        $scope.diffFromMax = calculateDiff(bid[bid.length - 1], max);
       }

       function calculateDiff(start,end) {
         return Number(((end * 100) / start - 100).toFixed(1));
      }
      $scope.options = {
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
    }
  };
});
