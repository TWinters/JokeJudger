/*global app,setTimeout*/
app.controller('RegisterController', ['$scope', '$routeParams', 'login', function($scope, $routeParams, loginService) {
	'use strict';
    var user = {},
        register = function() {
            loginService.register(user, function(success, reason) {
                if (success) {
                    console.log("Succesfully registering",user);
                    $scope.addAlert("success", "Successfully registered " + user.mail + ". Congratulations!"); 

                    loginService.checkLoggedIn();
                    if (loginService.getUser()) {
                        window.location = "/#/rate";                        
                    }
                } else {
                    reason = reason.indexOf("<") >= 0 ? "" : reason;
                    $scope.addAlert("danger", "Failed to register" + (reason? ": " + reason : ""));
                }
            });

        };


    $scope.user = user;
    $scope.alert = alert;
    $scope.register = register;
}]);
