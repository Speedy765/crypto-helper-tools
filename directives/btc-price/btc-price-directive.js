cryptotracky.directive('btcPrice', function($http) {
  return {
    templateUrl: "directives/btc-price/btc-price.html",
    link: function($scope) {

      $scope.dollarPrice = "-";
      $scope.euroPrice = "-";

      function handleResponse(response) {
        if(response.data && response.data.result) {
          var result = response.data.result;
          if (result.XXBTZEUR && result.XXBTZEUR.c) {
              $scope.euroPrice = result.XXBTZEUR.c[0].split(".")[0];
          }
          if (result.XXBTZUSD && result.XXBTZUSD.c) {
              $scope.dollarPrice = result.XXBTZUSD.c[0].split(".")[0];
          }
        }
      }

      var backend = "https://api.kraken.com/0/public/Ticker?pair=XBTUSD,XBTEUR";
      // Get prices on load
      $http.get(backend).then(handleResponse);

      // Refresh them every 60 seconds
      setInterval(function() {
        $http.get(backend).then(handleResponse);
      }, 1000 * 60);

    }
  };
});
