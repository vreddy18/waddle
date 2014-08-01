angular.module('waddle.services.auth', [])
  .factory('Auth', function ($q, $state) {

  var checkLogin = function () {
    var deferred = $q.defer();

    openFB.getLoginStatus(function(response){
      if (response.status === 'connected'){
        console.log('connected');
        deferred.resolve();
      } else {
        console.log('not connected');
        $state.go('frontpage');
        deferred.reject('not connected');
      }
    });

    return deferred.promise;
  };

  var logout = function () {
    console.log('logout');
    openFB.logout(function() {
      $state.go('frontpage');
    });
  };

  return {
    checkLogin: checkLogin,
    logout: logout
  }
    
  });