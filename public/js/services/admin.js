/*global app, console, window*/
app.factory('admin', ['$http', function($http) {
  'use strict';
  var jokeOverview = [],
      hasLoadedJokeOverview = {value:false},
      loadJokeOverview = function(cb) {
        // Retrieve new
        hasLoadedJokeOverview.value = false;
        return $http.get("/data/all-jokes.json")
          .then(function(success) {
            hasLoadedJokeOverview.value = true;
            jokeOverview.splice(0,jokeOverview.length)
            jokeOverview.extend(success.data);
            if (cb) {
              cb(true);
            }
           },function(error) {
              console.log('Error loading all jokes');
              if (error && error.length) {
                jokeOverview.extend(error);      
              }
              if (cb) {
                cb(false);
              }
           }
         );
      },
      setJokeOffensive = function(joke, offensive, cb) {
        $http.post("/set-joke-offensive", {joke:joke.id,offensive:offensive}, {}).then( function(data) {
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
          console.log("Error setting offensiveness joke",data);
        });

        // Update locally
        joke.offensive = offensive;

      };



    return {
        jokeOverview: jokeOverview,
        hasLoadedJokeOverview: hasLoadedJokeOverview,
        loadJokeOverview: loadJokeOverview,
        setJokeOffensive: setJokeOffensive
    };
}]);