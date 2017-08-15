/*global app,setTimeout*/
app.controller('LoginController', ['$scope', '$routeParams', 'login', function($scope, $routeParams, loginService) {
	'use strict';
    if ($routeParams.info === "fail") {
        $scope.addAlert("danger","Failed to log in");
    } else {
        // $scope.closeAlert();
    }


    // Redirect if  user already logged in
    if (loginService.getUser().mail) {
        window.location = "/#/rate";
    }
}]);
