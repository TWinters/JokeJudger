/*global app,setTimeout*/
app.controller('CreateController', ['$scope', '$routeParams', 'jokes', 'generator', function($scope, $routeParams, jokesService, generatorService) {
	'use strict';
    var joke = {},
        submitJoke = function() {
            jokesService.create(joke, function(success) {
                if (success) {
                    $scope.addAlert("success",'<span class="fa fa-check" aria-hidden="true"></span> Successfully added joke: \"' + jokesService.applyPattern(joke)
                        + '\"<p> '
                        +  "<em>Bookmark JokeJudger to come back later to check your ratings!</em></p>");
                    delete joke.x;
                    delete joke.y;
                    delete joke.z;
                } else {
                    $scope.addAlert("danger","Failed to add \"" + jokesService.applyPattern(joke) + "\"");
                }
            });
        },
        toggleSuggestions = function() {
            $scope.allowSuggestions = !$scope.allowSuggestions;
        },
        generateChallenge = function(joke) {
            var callback = function(data) {
                joke.x = data.x;
                joke.y = data.y;
                joke.z = data.z;
                $scope.generatingChallenge=false;
            }
            $scope.generatingChallenge = true;

            generatorService.generateChallenge(joke, callback);
        };

    $scope.toggleSuggestions = toggleSuggestions;
    $scope.allowSuggestions = false;
    $scope.generatingChallenge = false;
    $scope.submitJoke = submitJoke;
    $scope.joke = joke;
    // $scope.alert = alert;

    // generatorService
    $scope.generateChallenge = generateChallenge;
    $scope.getSuggestionsXY = function(xORy, joke){
        if (!$scope.allowSuggestions) {
            return [];
        }
        return generatorService.getSuggestionsXY(xORy, joke);
    }
    $scope.getSuggestionsZ =  function(joke){
        if (!$scope.allowSuggestions) {
            return [];
        }
        return generatorService.getSuggestionsZ(joke);
    }

    $scope.generatingX = false;
    $scope.generatingY = false;
    $scope.generatingZ = false;


    $scope.randomizeX = function(joke) {
        if (!$scope.generatingX) {
            $scope.generatingX = true;
            generatorService.randomizeX(joke, function() {
                $scope.generatingX = false;
            });            
        }
    };
    $scope.randomizeY = function(joke) {
        if (!$scope.generatingY) {
            $scope.generatingY = true;
            generatorService.randomizeY(joke, function() {
                $scope.generatingY = false;
            });            
        }
    };
    $scope.randomizeZ = function(joke) {
        if (!$scope.generatingZ) {
            $scope.generatingZ = true;
            generatorService.randomizeZ(joke, function() {
                $scope.generatingZ = false;
            });            
        }
    };
}]);
