cryptotracky.controller('realtimeController', function($scope, $stateParams, RealtimeService) {

  this.colors =  [ '#46BFBD', "#FF0000"];
  this.coin = $stateParams.coin;

  this.options = {
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

  if (this.coin.indexOf("-") === -1) {
    this.coin = "BTC-" + this.coin;
  }

  document.title = this.coin + "price";

  this.labels = [];
  this.data = [];
  this.diffFromMax = 0;

  RealtimeService.startPoll(this.coin, 1, (res) => {
    this.data = res.data;
    this.labels = res.labels;
    this.diffFromMax = res.diffFromMax;
  });

  $scope.$on("$destroy", function() {
    RealtimeService.stopPoll();
  });

});
