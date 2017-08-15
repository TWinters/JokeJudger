/*global app,setTimeout*/
app.controller('ReceivedRatingsController', ['$scope', 'login', 'jokes', 'util', 'tooltips', function($scope, loginService, jokesService, utilService, tooltipsService) {
	'use strict';
    var notificationsAmount = loginService.getUser().notificationsAmount,
        isNewNotification = function(ratings, parentIndex, localIndex) {
            var totalIndex = 0,
                idx;
            for (idx=0; idx<Math.min(ratings.length,parentIndex); idx+=1) {
                totalIndex+=ratings[idx].length;       
            }
            return totalIndex+localIndex < notificationsAmount;
        },
        toUTC = function(date){
            // var d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            var d = new Date();
            d.setTime( date.getTime() -  d.getTimezoneOffset()*60*1000 );
            return d;
            // return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
        };
    // Redirect if no user
    if (loginService.getUser().mail) {
        loginService.loadReceivedRatings();
    } else {
        $scope.addAlert("warning", "You must be logged in in order to see the ratings you've received.");
        window.location = "/#/login";
    }

    // loginService.loadNotificationsAmount();

    $scope.toUTC = toUTC;
    $scope.notificationsAmount = notificationsAmount;
    $scope.isNewNotification = isNewNotification;
    $scope.range = utilService.range;
    $scope.getUser = loginService.getUser;
    $scope.hasLoadedReceivedRatings = loginService.hasLoadedReceivedRatings;
    $scope.applyPattern = jokesService.applyPattern;
    $scope.labels = jokesService.labels;

    setTimeout(tooltipsService.activateTooltips, 100);

    // Delay
    setTimeout(loginService.loadNotificationsAmount, 2000);

}]);
