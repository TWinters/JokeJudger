/*global app,setTimeout*/
app.controller('ProfileController', ['$scope', 'login', 'jokes', 'tooltips', function($scope, loginService, jokesService, tooltipsService) {
	'use strict';

    var rateExplanation={value:"?"},
        createExplanation={value:"?"},
        rateRank = [
            {
                amount: 0,
                title: "Court room attendee"
            },
            {
                amount: 1,
                title: "Joke Law student"
            },
            {
                amount: 10,
                title: "Joke Law Graduate"
            },
            {
                amount: 50,
                title: "Master of Joke Law"
            },
            {
                amount: 100,
                title: "Joke Lawyer"
            },
            {
                amount: 200,
                title: "Lord of Jokes Justice"
            },
            {
                amount: 500,
                title: "Deputy President of the Supreme Joke Court"
            },
            {
                amount: 1000,
                title: "President of the Supreme Joke Court"
            },
        ],
        createRank = [
            {
                amount: 0,
                title: "Audience member"
            },
            {
                amount: 1,
                title: "One trick pony"
            },
            {
                amount: 2,
                title: "Improv comedian"
            },
            {
                amount: 10,
                title: "Stand-up comedian"
            },
            {
                amount: 50,
                title: "Aspiring comedy writer"
            },
            {
                amount: 100,
                title: "Comedy genius"
            },
            {
                amount: 200,
                title: "Oscar-winning comedy writer"
            },
        ],
        getRank = function(rankList, score) {
            var currentRank,
                idx;

            for (idx=0; idx < rankList.length; idx+=1) {
                if (rankList[idx].amount <= score) {
                    currentRank = rankList[idx];
                } else {
                    break;
                }
            }
            return currentRank;
        },
        getRateRank = function(score) {
            var rank = getRank(rateRank,score||0);
            rateExplanation.value = "Rated at least "+rank.amount +" joke" + (rank.amount==1?'':'s');
            return rank;
        },
        getCreateRank = function(score) {
            var rank = getRank(createRank,(loginService.getUser().jokes && loginService.getUser().jokes.length)||0);
            createExplanation.value = "Created at least "+rank.amount+" joke"+ (rank.amount==1?'':'s');
            return rank;
        },
        modifyAdult = function() {
            loginService.modifyAdult(loginService.getUser().adult, function(success) {
                if (success) {
                    loginService.loadProfile();
                } else {
                    $scope.setAlert("Failed to update allowance to see offensive jokes.");
                }
            });
            loginService.getUser().adult = !loginService.getUser().adult;
        };


    loginService.loadProfile();
    setTimeout(tooltipsService.activateTooltips, 100);
    setTimeout(tooltipsService.activateTooltips, 1000);
    setTimeout(tooltipsService.activateTooltips, 2000);


    $scope.rateExplanation = rateExplanation;
    $scope.createExplanation = createExplanation;
    $scope.getRateRank = getRateRank;
    $scope.getCreateRank = getCreateRank;
    $scope.modifyAdult = modifyAdult;
    $scope.getUser = loginService.getUser;

}]);
