cryptotracky.controller('realtimeController', function($stateParams) {
  this.coin = $stateParams.coin;
  document.title = this.coin;
});
