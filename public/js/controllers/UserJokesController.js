/*global app,setTimeout*/
app.controller('UserJokesController', ['$scope', 'login', 'jokes', 'util', 'tooltips', function($scope, loginService, jokesService, utilService, tooltipsService) {
	'use strict';

    var trimNumber = function(number) {
            return Math.round( (number) *10) /10
        },
        toDate = function(date) {
            return Date.parse(date);
        },
        histogramsToShow = [],
        isShowingHistogram = function(joke) {
            return histogramsToShow.contains(joke.id);
        },
        toggleHistogram = function(joke) {
            var idx = histogramsToShow.indexOf(joke.id);
            if (idx < 0) {
                histogramsToShow.push(joke.id);               
            } else {
                histogramsToShow.splice(idx,1);
            }
        },
        openAllHistograms = function() {
            var i, idx, joke;
            for (i = 0; i < loginService.getUser().jokes.length; i+=1) {
                joke = loginService.getUser().jokes[i];
                idx = histogramsToShow.indexOf(joke.id);
                if (idx < 0) {
                    histogramsToShow.push(joke.id);
                }
            }
        },
        closeAllHistograms = function() {
            histogramsToShow.splice(0,histogramsToShow.length);
        },
        ratingsToShow = [],
        isShowingRatings = function(joke) {
            return ratingsToShow.contains(joke.id);
        },
        toggleRatings = function(joke) {
            var idx = ratingsToShow.indexOf(joke.id);
            if (idx < 0) {
                ratingsToShow.push(joke.id);               
            } else {
                ratingsToShow.splice(idx,1);
            }
        },
        toStarBins = function(data, incomprehensives, offensives) {
            var idx,
                labels = jokesService.labels,
                result = [
                    // Header
                    ['rating', '',{role: 'style'}],
                    // Non-numeric markings
                    ['Too offensive',offensives,'#a26b77'],
                    ['Didn\'t understand',incomprehensives,'#eeeeee'],
                    // Numerics
                    [labels[0]+' (1\u2605)',0,'#333333'],
                    [labels[1]+' (2\u2605)',0,'#333333'],
                    [labels[2]+' (3\u2605)',0,'#333333'],
                    [labels[3]+' (4\u2605)',0,'#333333'],
                    [labels[4]+' (5\u2605)',0,'#333333']
                ];
            for (idx = 0; idx < data.length; idx+=1) {
                result[data[idx]+2][1] += 1;
            }
            return result;
        },
        getJokeById = function(id) {
            var i,
                jokes = loginService.getUser().jokes;
            id = parseInt(id, 10);
            for (i = 0; i < jokes.length; i+=1) {
                if (jokes[i].id === id) {
                    return jokes[i];
                }
            }
        },
        calculateHistogram = function(joke) {
            var jokeData = joke.ratings.map(function(rating) {return parseInt(rating.score);});
            var data = google.visualization.arrayToDataTable(
                    toStarBins(jokeData, joke.amountIncomprehensives, joke.amountOffensives)
                    // [
                    //     ['City', '2010 Population', '2000 Population'],
                    //     ['New York City, NY', 8175000, 8008000],
                    //     ['Los Angeles, CA', 3792000, 3694000],
                    //     ['Chicago, IL', 2695000, 2896000],
                    //     ['Houston, TX', 2099000, 1953000],
                    //     ['Philadelphia, PA', 1526000, 1517000]
                    // ]
                );

            var options = {
                    // title: 'Ratings for ' + jokesService.applyPattern(joke),
                    legend: { position: 'none' },
                    bars: 'horizontal',
                    chartArea: {width: '80%'},
                    colors: ['#333333'],
                    hAxis: {
                        title: 'Score',
                        minValue: 1,
                        maxValue: 5
                    },
                    vAxis: {
                        title: 'Amount of ratings'
                    },
                    bar: { groupWidth: "92%" }
                };
            var histogramDiv = document.getElementById('histogram'+joke.id);

            var chart = new google.visualization.ColumnChart(histogramDiv);
            chart.draw(data, options);




        };


    $(window).resize(function(){
        var idx,joke;
        for (idx=0; idx<histogramsToShow.length; idx++) {
            joke = getJokeById(histogramsToShow[idx]);
            calculateHistogram(joke);
        }
    });

    // Redirect if no user
    if (loginService.getUser().mail) {
        loginService.loadUserJokes();
    } else {
        $scope.addAlert("warning", "You must be logged in in order to see the jokes you've created.");
        window.location = "/#/login";
    }

    setTimeout(tooltipsService.activateTooltips, 100);

    $scope.trimNumber = trimNumber;
    $scope.range = utilService.range;
    $scope.toDate = toDate;

    $scope.isShowingHistogram = isShowingHistogram;
    $scope.toggleHistogram = toggleHistogram;
    $scope.isShowingRatings = isShowingRatings;
    $scope.toggleRatings = toggleRatings;
    $scope.openAllHistograms = openAllHistograms;
    $scope.closeAllHistograms = closeAllHistograms;

    $scope.calculateHistogram = calculateHistogram;

    $scope.getUser = loginService.getUser;
    $scope.hasLoadedUserJokes = loginService.hasLoadedUserJokes;
    $scope.applyPattern = jokesService.applyPattern;


    //console.log("user:",$scope.getUser() );

}]);
