cryptotracky.service('ChartService', function($sce) {

  var svg = '<svg viewBox="0 0 100 30" class="chart"><polyline fill="none" stroke="#0074d9" stroke-width="2" points="{{POINTS}}"/></svg>';

  function getSvgForCoin(coinData) {
    var chartLog = angular.copy(coinData.priceLog).reverse();
    var points = [];
    var max = -300,min = 300;
    var pointsCount = 100 / (coinData.log.length - 1);
    chartLog.push(coinData.current);
    chartLog.forEach(function(change) {
      change = parseFloat(change);
      if (change > max) {
        max = change;
      }
      if (change < min) {
        min = change
      }
    });
    var diff;
    if (max < 0) {
      diff = parseFloat(0 - min) - (parseFloat(0 - max));
    }
    else {
       diff = parseFloat(max) - (parseFloat(min));
    }
    var heights = diff / 30;
    chartLog.forEach(function(change, index) {
      var point = max - change;
      if (point !== 0) {
        point = point / heights;
      }
      points.push(index * pointsCount + "," + point);
    });

    return $sce.trustAsHtml(svg.replace("{{POINTS}}", points.join(" ")));
  }

  return {
    getSvgForCoin: getSvgForCoin
  };
});
