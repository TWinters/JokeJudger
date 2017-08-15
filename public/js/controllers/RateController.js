/*global app,setTimeout*/
app.controller('RateController', ['$scope', 'jokes', 'tooltips', function($scope, jokesService, tooltipsService) {
	'use strict';
    var stars = [],
        currentRating = 0,
        maxRating = 5,
        // Same rating labels as Venour
        labels = jokesService.labels,
        // fullStarLabel = "typcn typcn-star fa-4x",
        // emptyStarLabel = "typcn typcn-star-outline fa-4x",
        fullStarLabel = "fa fa-star fa-4x",
        emptyStarLabel = "fa fa-star-o fa-4x",
        getStarIcon = function(number) {
            if (number <= currentRating) {
                return fullStarLabel;
            } else {
                return emptyStarLabel;
            }
        },
        getStarLabel = function(number) {
            return labels[number-1];
        },
        setupStars = function() {
            var i;
            for (i = 1; i <= maxRating; i++) {
                stars.push({
                    rating: i,
                    rate: function(i) {
                        return function() {
                            setRating(i);
                        };
                    }(i),
                    icon: getStarIcon(i),
                    label: getStarLabel(i),
                });
            }
        },
        recalculateStars = function() {
            var i;
            for (i = 1; i <= maxRating; i++) {
                stars[i-1].icon = getStarIcon(i);
            }
        },
        setRating = function(amount) {
            currentRating = amount;
            recalculateStars();
        },
        is_touch_device = function() {
          return 'ontouchstart' in window        // works on most browsers 
              || navigator.maxTouchPoints;       // works on IE10/11 and Surface
        },
        rate = function(joke, rating, cb) {
            jokesService.rate(joke, rating, function(success) {
                if(success) {
                    if (is_touch_device()) {
                        setRating(0);                        
                    }
                }
                if (cb) {
                    cb(success);                    
                }
            });
        };

    jokesService.loadJokes();

    setupStars();

    setTimeout(tooltipsService.activateTooltips, 100);





    $scope.stars = stars;
    $scope.setRating = setRating;
    $scope.rate = rate;
    $scope.markAsIncomprehensive = jokesService.markAsIncomprehensive;
    $scope.markAsTooOffensive = jokesService.markAsTooOffensive;

    $scope.jokes = jokesService.jokes;
    $scope.applyPattern = jokesService.applyPattern;
    $scope.getPremise = jokesService.getPremise;
    $scope.getConclusion = jokesService.getConclusion;
    $scope.hasLoadedJokes = jokesService.hasLoadedJokes;
}]);
