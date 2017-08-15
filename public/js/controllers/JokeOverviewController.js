/*global app,setTimeout*/
app.controller('JokeOverviewController', ['$scope', 'login', 'admin', 'jokes', 'tooltips', function($scope, loginService, adminService, jokesService, tooltipsService) {
	'use strict';

    var sortOn = function(attribute) {
        $scope.sorting = attribute;
    }

    // Redirect if no user
    if (loginService.getUser().mail && loginService.getUser().admin) {
        adminService.loadJokeOverview();
    } else {
        $scope.addAlert("warning", "Forbidden page.");
        window.location = "/#/login";
    }

    $scope.sorting = "dateAdded";

    $scope.sortOn = sortOn;
    $scope.jokeOverview = adminService.jokeOverview;
    $scope.getUser = loginService.getUser;
    $scope.hasLoadedJokeOverview = adminService.hasLoadedJokeOverview;
    $scope.applyPattern = jokesService.applyPattern;
    $scope.setJokeOffensive = adminService.setJokeOffensive;

    setTimeout(tooltipsService.activateTooltips, 100);

}]);
