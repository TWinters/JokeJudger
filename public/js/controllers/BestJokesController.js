/*global app,setTimeout*/
app.controller('BestJokesController', ['$scope', '$http', 'jokes', 'tooltips', function($scope, $http, jokesService, tooltipsService) {
	'use strict';

    var jokesLastWeek = [],
        jokesLastMonth = [],
        jokesAllTime = [],

        hasLoadedBestJokes = {value:false},

        loadBestJokes = function() {
            var loadedWeek = false,
                loadedMonth = false,
                loadedAllTime = false,
                checker = function() {
                    if (loadedWeek && loadedMonth && loadedAllTime) {
                        hasLoadedBestJokes.value = true;
                    }
                };

            // Retrieve
            hasLoadedBestJokes.value = false;
            $http.get("/data/jokes-week.json").then(function(success) {
                jokesLastWeek.splice(0,jokesLastWeek.length)
                jokesLastWeek.extend(success.data);
                loadedWeek = true;
                checker();
            });
            $http.get("/data/jokes-month.json").then(function(success) {
                jokesLastMonth.splice(0,jokesLastMonth.length)
                jokesLastMonth.extend(success.data);
                loadedMonth = true;
                checker();
            });
            $http.get("/data/jokes-all-time.json").then(function(success) {
                jokesAllTime.splice(0,jokesAllTime.length)
                jokesAllTime.extend(success.data);
                // Only best five
                jokesAllTime.splice(5,jokesAllTime.length-5);
                loadedAllTime = true;
                checker();
            });
        },
        trimNumber = function(number) {
            return Math.round( (number) *10) /10
        };

    loadBestJokes();


    $scope.jokesLastWeek=jokesLastWeek;
    $scope.jokesLastMonth=jokesLastMonth;
    $scope.jokesAllTime=jokesAllTime;
    $scope.hasLoadedBestJokes=hasLoadedBestJokes;

    $scope.trimNumber=trimNumber;

    $scope.applyPattern = jokesService.applyPattern;

    setTimeout(tooltipsService.activateTooltips, 100);

}]);
