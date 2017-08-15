/*global app,extendObject*/
app.controller('LoggedInController', ['$scope', 'login', function($scope, loginService) {
	'use strict';
    var prop,
        alert = {message:"",type:""},
        addAlert = function(type, message) {
            alert.type = type;
            alert.message = message;
        },
        closeAlert = function() {
            alert.message = "";
            alert.type = "";
        };

    loginService.loadNotificationsAmount();

    $scope.alert = alert;
    $scope.addAlert = addAlert;
    $scope.closeAlert = closeAlert;
    $scope.userLogin = loginService.userLogin;
    $scope.login = loginService.login;
    $scope.logOut = loginService.logOut;
    $scope.getUserId = loginService.getUserId;
    $scope.getUser = loginService.getUser;
}]);