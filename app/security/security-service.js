cryptotracky.run(function ($transitions, cognitoService, $rootScope) {
  var vipRestriction = true;
  $rootScope.vip = false;
  var restrictedStates = ["overview-long-binance", "realtime-multi"];
  if (vipRestriction) {
    restrictedStates.forEach(function(restrictedState) {
      $transitions.onBefore({to : restrictedState}, function(trans) {
        return cognitoService.isVipActive().then(function() {
          return true;
          $rootScope.vip = true;
        }, function() {
          return trans.router.stateService.target('login');
        })
      });
    });
  }
});
