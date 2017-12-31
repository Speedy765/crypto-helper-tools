cryptotracky.service('cognitoService', function ($q) {

  // Region
  AWS.config.region = 'eu-west-1';
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-west-1_Z2LsYZM0w'
  });

  // Cognito User Pool Id
  AWSCognito.config.region = 'eu-west-1';
  AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-west-1_Z2LsYZM0w'
  });

  this.getUserPool = function () {
    var poolData = {
      UserPoolId: 'eu-west-1_Z2LsYZM0w',
      ClientId: '5m95uq19db84ttc8bgbgib769d'
    };
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    return userPool;
  };

  this.getUser = function (userPool, username) {
    var userData = {
      Username: username,
      Pool: userPool
    };
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    return cognitoUser;
  };

  this.getAuthenticationDetails = function (username, password) {
    var authenticationData = {
      Username: username,
      Password: password
    };
    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
    return authenticationDetails;
  };

  this.getUserAttributes = function () {
    var attributes = [];
    for (var i = 0; i < arguments.length; i++) {
      var attr = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(arguments[i]);
      attributes.push(attr);
    }
    return attributes;
  };

  this.isVipActive = function() {
    var userPool = this.getUserPool();

    var currentUser = userPool.getCurrentUser();

    console.log(currentUser);

    var deferred = $q.defer();

    if (currentUser != null) {
      currentUser.getSession(function(err, session) {
        if (err) {
          alert(err);
          deferred.reject();
        }
        // console.log('session validity: ' + session.isValid());
        var sessionIdInfo = jwt_decode(session.getIdToken().jwtToken);
        // console.log("Group Info :"+sessionIdInfo['cognito:groups']);
        if (sessionIdInfo['cognito:groups'][0] === "VIP") {
          deferred.resolve();
        }
        else {
          deferred.reject();
        }
      });
    }
    else {
      deferred.reject();
    }

    return deferred.promise;

  }

});
