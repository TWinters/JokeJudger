/*global app,setTimeout*/
app.controller('ResetPasswordController', ['$scope', 'login', function($scope, loginService) {
	'use strict';
    var 
        details = {},
        resetPassword = function() {
            $scope.passwordUpdateStatus = "";
            loginService.resetPassword(details, function(success, reason) {
                if (success) {
                    $scope.addAlert("success", "Successfully reset password for " + details.mail +". Check your mail to get the new password."); 
                } else {
                    reason = reason && reason.indexOf("<") >= 0 ? "" : reason;
                    $scope.addAlert("danger", "Failed to reset password" + (reason? ": " + reason : ""));
                }
            });

        };

    $scope.details = details;
    $scope.resetPassword = resetPassword;
}]);