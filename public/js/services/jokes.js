/*global app, console, window*/
app.factory('jokes', ['$http', function($http) {
  'use strict';
  var jokes = [],
      hasLoadedJokes = {value:false},
      labels = ["Not a joke","Poor", "Okay", "Quite good", "Great"],
      getPremise = function(joke) {
        if (!joke || !joke.x || !joke.y) {
          return "";
        }
        return "I like my <strong>" + joke.x + "</strong> like I like my <strong>" + joke.y + "</strong>: ";
      },
      getConclusion = function(joke) {
        if (!joke || !joke.z) {
          return "";
        }
        return "<strong>" +joke.z + "</strong>.";
      },
      applyPattern = function(joke, lineBreak) {
        if (!joke || !joke.x || !joke.y || !joke.z) {
          return "";
        }
        var begin = lineBreak ? "<p class=\"jokepattern\">" : "<span class=\"jokepattern\">",
            end = lineBreak ? "</p>" : "</span>";
        return begin+getPremise(joke) + (lineBreak ? "</p><p class=\"jokepattern\">" : "") +   getConclusion(joke)+end;
      },
      loadJokes = function(cb) {
        // Retrieve new
        hasLoadedJokes.value = false;
        return $http.get("/data/jokes.json")
        .then(function(success) {
            hasLoadedJokes.value = true;
            // console.log("hasLoadedJokes",hasLoadedJokes);
            jokes.splice(0,jokes.length)
            jokes.extend(success.data);
            if (cb) {
              cb(true);
            }
         },function(error) {
            console.log('Error loading jokes');
            if (error && error.length) {
              jokes.extend(error);      
            }
            if (cb) {
              cb(false);
            }
         }
         );
      },
      create = function(joke, cb) {
        $http.post("/create", joke, {}).then( function() {
          if (cb) {
            cb(true);
          }
        }, function(data) {
          if (cb) {
            cb(false);
          }
          if (data && data.status == 401) {
            window.location = "/#/login";
          }
          console.log("Error creating joke");
        });
      },
      clearJoke = function(joke) {
        var index = jokes.indexOf(joke);
        if (index > -1) {
            jokes.splice(index, 1);
        }
      },
      rate = function(joke, rating, cb) {
        clearJoke(joke);
        $http.post("/rate", {joke:joke.id,rating:rating}, {}).then( function(data) {
          if (cb) {
            cb(true);
          }
        }, function(data) {
          if (cb) {
            cb(false);
          }
          if (data && data.status == 401) {
            window.location = "/#/register";
          }
          console.log("Error rating joke",data);
        });

      },
      markAsIncomprehensive = function(joke, cb) {
        clearJoke(joke);
        $http.post("/mark-joke-incomprehensive", {joke:joke.id}, {}).then( function(data) {
          if (cb) {
            cb(true);
          }
        }, function(data) {
          if (cb) {
            cb(false);
          }
          if (data && data.status == 401) {
            window.location = "/#/register";
          }
          console.log("Error marking joke as incomprehensive",data);
        });
      },
      markAsTooOffensive = function(joke, cb) {
        clearJoke(joke);
        $http.post("/mark-joke-offensive", {joke:joke.id}, {}).then( function(data) {
          if (cb) {
            cb(true);
          }
        }, function(data) {
          if (cb) {
            cb(false);
          }
          if (data && data.status == 401) {
            window.location = "/#/register";
          }
          console.log("Error marking joke",data);
        });
      };


    return {
        labels: labels,
        loadJokes: loadJokes,
        jokes: jokes,
        applyPattern : applyPattern,
        getPremise : getPremise,
        getConclusion : getConclusion,
        rate: rate,
        markAsIncomprehensive: markAsIncomprehensive,
        markAsTooOffensive: markAsTooOffensive,
        create: create,
        hasLoadedJokes: hasLoadedJokes
    };
}]);