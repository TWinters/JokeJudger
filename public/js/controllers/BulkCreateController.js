/*global app,setTimeout*/
app.controller('BulkCreateController', ['$scope', 'jokes', function($scope, jokesService) {
	'use strict';
    var bulk = {jokes:""},
        submitJokes = function() {
            var successfulTransfers = 0,
                failedTransfers = 0,
                jokes = bulk.jokes.split('\n'),
                i, splitted, joke;

            bulk.jokes = "";

            for (i = 0; i < jokes.length; i+=1) {

                splitted = jokes[i].split("\t"),
                joke = {
                    x:splitted[0].trim(),
                    y:splitted[1].trim(),
                    z:splitted[2].trim()
                };

                jokesService.create(joke, function(success) {
                    if (success) {
                        successfulTransfers += 1;
                        $scope.addAlert("success",'<span class="fa fa-check" aria-hidden="true"></span> Successfully added ' + successfulTransfers + ' jokes.\n'+failedTransfers + ' failed.');
                    } else {
                        failedTransfers += 1;
                        $scope.addAlert("danger",'<span class="fa fa-check" aria-hidden="true"></span> Successfully added ' + successfulTransfers + ' jokes.\n'+failedTransfers + ' failed.');
                    }
                });



            }

        };

    $scope.submitJokes = submitJokes;
    $scope.bulk = bulk;

}]);
