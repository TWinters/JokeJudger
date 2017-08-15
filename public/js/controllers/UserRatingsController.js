/*global app,setTimeout*/
app.controller('UserRatingsController', ['$scope', 'login', 'jokes', 'util', 'tooltips', function($scope, loginService, jokesService, utilService, tooltipsService) {
	'use strict';




    // Redirect if no user
    if (loginService.getUser().mail) {
        loginService.loadUserRatings();
    } else {
        $scope.addAlert("warning", "You must be logged in in order to see the ratings you've given.");
        window.location = "/#/login";
    }


    $scope.range = utilService.range;
    $scope.getUser = loginService.getUser;
    $scope.hasLoadedUserRatings = loginService.hasLoadedUserRatings;
    $scope.applyPattern = jokesService.applyPattern;
    $scope.labels = jokesService.labels;


    //console.log("user:",$scope.getUser() );
    setTimeout(tooltipsService.activateTooltips, 100);

}]);
