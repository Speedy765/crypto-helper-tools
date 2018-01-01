cryptotracky.run(function ($transitions, cognitoService) {
  // Allow everyone access for now
  var vipRestriction = false;
  var restrictedStates = ["overview-long-binance", "realtime-multi"];
  if (vipRestriction) {
    restrictedStates.forEach(function(restrictedState) {
      $transitions.onBefore({to : restrictedState}, function(trans) {
        return cognitoService.isVipActive().then(function() {
          return true;
        }, function() {
          return trans.router.stateService.target('login');
        })
      });
    });
  }


});
