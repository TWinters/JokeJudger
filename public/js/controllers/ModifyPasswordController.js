/*global app,setTimeout*/
app.controller('ModifyPasswordController', ['$scope', 'login', function($scope, loginService) {
	'use strict';
    var 
        details = {},
        submitPassword = function() {
            $scope.passwordUpdateStatus = "";
            loginService.modifyPassword(details, function(success) {
                if (success) {
                    $scope.addAlert("success", "Successfully updated password");
                } else {
                    details.oldPassword = "";
                    $scope.addAlert("danger", "Failed to update password.");                  
                }
            });

        };

    $scope.details = details;
    $scope.submitPassword = submitPassword;
}]);