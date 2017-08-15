/*global app, console, window*/
app.factory('util', ['$http', function($http) {
  'use strict';
  var range = function(min, max, step) {
            min = parseInt(min);
            max = parseInt(max);
            step = step || 1;
            var input = [];
            for (var i = min; i <= max; i += step) {
                input.push(i);
            }
            return input;
        };

    return {
        range: range
    };
}]);