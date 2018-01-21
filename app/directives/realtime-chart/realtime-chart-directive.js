cryptotracky.directive('realtimeChart', function(RealtimeService) {
  return {
    templateUrl: "directives/realtime-chart/realtime-chart.html",
    scope: {
      coin : "="
    },
    link : function($scope, element) {

      if ($scope.coin.indexOf("-") === -1) {
        $scope.coin = "BTC-" + $scope.coin;
      }
      var coin = $scope.coin;
      $scope.colors =  [ '#46BFBD', "#FF0000"];
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

      $scope.labels = [];
      $scope.data = [];
      $scope.diffFromMax = 0;

      RealtimeService.startPoll(coin, 1, (res) => {
        $scope.data = res.data;
        $scope.labels = res.labels;
        $scope.diffFromMax = res.diffFromMax;
        $scope.marketInfo = res.marketInfo;
        $scope.dayDiff = (($scope.marketInfo.Bid * 100 / $scope.marketInfo.PrevDay) - 100).toFixed(1);
        $scope.spread = calculateDiff(res.marketInfo.Bid, res.marketInfo.Ask);
      });

      $scope.$on("$destroy", function() {
        RealtimeService.stopPoll();
      });

      function calculateDiff(start,end) {
        return Number(((end * 100) / start - 100).toFixed(2));
      }
    }
  };
});
