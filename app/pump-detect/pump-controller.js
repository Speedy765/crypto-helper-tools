cryptotracky.controller('pumpDetectController', function($http, $scope, $stateParams) {

  $scope.activeCoins = [];

  var backend = "https://realtime.cryptotracky.com/pump-detect?interval=5";
  // var backend = "http://localhost:1400/pump-detect?interval=5";
  setInterval(function() {
    $http.get(backend).
    then(handleResponse);
  }, 1000);

  function coinNotActive(coin) {
    return $scope.activeCoins.indexOf(coin) === -1;
  }

  function handleResponse(response) {
    if (response.data) {
      response.data.forEach(function(coin) {
        if (coin.diff > 5 && coin.coin.indexOf("BTC-") === 0 && coinNotActive(coin.coin)) {
          $scope.activeCoins.push(coin.coin);
          Push.create(coin.coin, {
            body: 'How\'s it hangin\'?',
            icon: '/images/icon.png',
            link: '/#',
            timeout: 4000,
            onClick: function () {
                console.log("Fired!");
                window.focus();
                this.close();
            },
            vibrate: [200, 100, 200, 100, 200, 100, 200]
          });
        }
      })
    }
  }

  // $rootScope.coins = $stateParams.coins.split(",");

});
