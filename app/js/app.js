(function(angular) {
'use strict';
var ref = new Firebase("https://ojsk.firebaseio.com");

angular.module('mainApp', ['ngRoute', 'firebase'])

.controller('MainController', function($scope, $rootScope, $route, $routeParams, $location, $window, $http) {
  $scope.$route = $route;
  $scope.$location = $location;
  $scope.$routeParams = $routeParams;

  $scope.createAccount = function(email, password) {

    $http.post('/createUser', {
      email: email,
      password: password
    }).success(function(data, status, headers, config) {
      ref.authWithPassword({
        email    : email,
        password : password
      }, function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log("Authenticated successfully with payload:", authData);
          $rootScope.navigateTo('#/users/account');
        }
      });    
    }).error(function(data, status, headers, config) {
    });   
  };

  $scope.login = function(email, password) {
    ref.authWithPassword({
      email    : email,
      password : password
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        $rootScope.navigateTo('#/users/account');
      }
    });    
  };

  $scope.changeEmail = function(oldEmail, newEmail, password, uid) {
    $http.post('/changeEmail', {
      oldEmail: oldEmail,
      newEmail: newEmail,
      password: password,
      uid: uid
    }).success(function(data, status, headers, config) {
      // Need to clear fields on success
      
    }).error(function(data, status, headers, config) {
    });   
  };

  $scope.changePassword = function(email, oldPassword, newPassword, uid) {
    $http.post('/changePassword', {
      email: email,
      oldPassword: oldPassword,
      newPassword: newPassword,
      uid: uid
    }).success(function(data, status, headers, config) {
      // Need to clear fields on success

    }).error(function(data, status, headers, config) {
    });   
  };

  $scope.resetPassword = function(email) {
    ref.resetPassword({
      email : email
    }, function(error) {
      if (error === null) {
        console.log("Password reset email sent successfully");
      } else {
        console.log("Error sending password reset email:", error);
      }
    });    
  };

  $scope.logout = function() {
    ref.unauth();
    $scope.navigateTo("#/");
  };

  $rootScope.navigateTo = function(shortUrl) {
    var landingUrl = "http://" + $window.location.host + shortUrl;
    $window.location.href = landingUrl;
  };

  // returns the length of an object {}
  $rootScope.sizeOf = function(obj) {
	return Object.keys(obj).length;
  };

	// this is called everytime the users Firebase authentication changes
	function authDataCallback(authData) {
	  if (authData) {
	    console.log("User " + authData.uid + " is logged in with " + authData.provider);
	  } else {
	    ref.authAnonymously(function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log("Authenticated successfully with payload:", authData);
        }
      });
	  }
    $rootScope.authData = authData;
	}

	ref.onAuth(authDataCallback);  
})

.controller('IndexCtrl', function($rootScope, $scope, $routeParams, $firebaseObject) {
  $scope.params = $routeParams;
})

.controller('AdminCtrl', function($rootScope, $scope, $routeParams, $firebaseObject) {
  $scope.params = $routeParams;

  // gets all the users information from Firebase
  $scope.users = $firebaseObject(ref.child('users'));

  // Redirects user to the main page if they are not an admin
  ref.child('users').child($rootScope.authData.uid).child('admin').on('value', function(snap) {
    if (!snap.val()) {
      $rootScope.navigateTo('#/');
    }
  });

  // changes the status of the user
  $scope.toggleUser = function(uid, type) {
    ref.child('users').child(uid).child(type).transaction(function(status) {
      return !status;
    });
  };
})

.controller('UsersCtrl', function($rootScope, $scope, $routeParams, $firebaseObject) {
  $scope.params = $routeParams;
  // Gets the information of a specific user
  $scope.user = $firebaseObject(ref.child('users').child($rootScope.authData.uid));
})

.controller('ResetPasswordCtrl', function($rootScope, $scope, $routeParams, $firebaseObject) {
  
})

.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/index.html',
    controller: 'IndexCtrl'
  })
  .when('/admin', {
    templateUrl: 'views/admin.html',
    controller: 'AdminCtrl'
  })
  .when('/users/account', {
    templateUrl: 'views/user-account.html',
    controller: 'UsersCtrl'
  })
  .when('/users/account/reset-password', {
    templateUrl: 'views/reset-password.html',
    controller: 'ResetPasswordCtrl'
  })
  ;
  // configure html5 to get links working on jsfiddle
  // $locationProvider.html5Mode(true);
  });
})(window.angular);