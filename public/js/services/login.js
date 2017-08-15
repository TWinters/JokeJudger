/*global app*/
app.factory('login', ['$http', function($http) {
	'use strict';
	
	var loggedInUser = {id:-1},
		userLogin = {},
		checkLoggedIn = function(cb) {
			var member;
			$http.get('data/logged-in-user.json')
		       .then(
		       		function(success) {
		       			var newUser = success.data;
		       			// console.log("Logged in as ", newUser);
			       		// Clear current logged in user
			       		for (var member in loggedInUser) {
			       			delete loggedInUser[member];
			       		}

			       		for (var member in newUser) {
			       			loggedInUser[member] = newUser[member];
			       		}
			       		loadNotificationsAmount();
			       		if (cb) {
			       			cb(true);
			       		}
		       		},
		       		function(error) {
		       			console.log("Could not retrieve user");
		       			if (cb) {
		       				cb(false);
		       			}
		       		}
		   );

		},
		login = function(cb) {
			//console.log("Sending login request as",userLogin);
			$http.post("/login", userLogin, {}).then( function( data) {
	          	//console.log("success login callback", data);
	          	if (cb) {
	            	cb(true);
	          	}
				checkLoggedIn();
	        }, function(err,data) {
	          	if (cb) {
	           		cb(false);
	          	}
				checkLoggedIn();
	          	console.log("Error logging in");
	        });


		},
		register = function(user, cb) {
		 	$http.post("/create-user", user, {}).then( function() {
	          if (cb) {
	            cb(true);
	          }
	        }, function(err,data) {
	          if (cb) {
	            cb(false, err.data);
	          }
	        });
		},
		modifyPassword = function(details, cb) {
		 	$http.post("/modify-password", details, {}).then( function() {
	          if (cb) {
	            cb(true);
	          }
	        }, function(err,data) {
	          if (cb) {
	            cb(false, err.data);
	          }
	        });
		},
		modifyAdult = function(currentAdultState, cb) {
		 	$http.post("/modify-adult", {adult: !currentAdultState}, {}).then( function() {
	 			checkLoggedIn(function() {
		         	if (cb) {
		            	cb(true);
		          	}
	 			});
	        }, function(err,data) {
	          	if (cb) {
	            	cb(false, err.data);
	          	}
	        });
		},
		resetPassword = function(details, cb) {
		 	$http.post("/reset-password", details, {}).then( function() {
	          if (cb) {
	            cb(true);
	          }
	        }, function(err,data) {
	        	console.log("Failed resetting password",err,data);
	          if (cb) {
	            cb(false, err.data);
	          }
	        });
		},
      	hasLoadedUserJokes = {value:false},
		loadUserJokes = function(cb) {
			hasLoadedUserJokes.value=false;
			$http.get('data/user-jokes.json')
		       .then(
		       		function(success) {
						hasLoadedUserJokes.value=true;
		       			var jokes = success.data;
			       		loggedInUser.jokes = jokes;
		       		},
		       		function(error) {
						hasLoadedUserJokes.value=true;
		       			console.log("Could not retrieve user jokes");
		       		}
		   	);
		},
      	hasLoadedUserRatings = {value:false},
		loadUserRatings = function(cb) {
			hasLoadedUserRatings.value=false;
			$http.get('data/user-ratings.json')
		       .then(
		       		function(success) {
						hasLoadedUserRatings.value=true;
		       			var ratings = success.data;
			       		loggedInUser.ratings = ratings;
		       		},
		       		function(error) {
						hasLoadedUserRatings.value=true;
		       			console.log("Could not retrieve user ratings");
		       		}
		   	);
			$http.get('data/user-markings.json')
		       .then(
		       		function(success) {
		       			var markings = success.data;
			       		loggedInUser.markings = markings;
		       		},
		       		function(error) {
		       			console.log("Could not retrieve user markings");
		       		}
		   	);
		},



		// Received ratings
		toLocaleDate = function(e) {
            if (e.date.toLocaleDateString) {
                e.date = e.date.toLocaleDateString();            
            }
            return e;
        },
        toValueSet = function(list) {
            var result = {},
                currentDate,
                index;

            if (!list || !list.length) {
                return result;
            }

            for (index=0; index<list.length; index+=1) {
                currentDate = list[index].date.toLocaleDateString();

                while (index<list.length && list[index].date.toLocaleDateString() === currentDate) {
                    if (!result[currentDate] || !result[currentDate].length) {
                        result[currentDate] = [];
                    }
                    result[currentDate].push(list[index]);

                    index++;
                }

            }
            return result;
        },
      	hasLoadedReceivedRatings = {value:false},
		loadReceivedRatings = function(cb) {
			hasLoadedReceivedRatings.value=false;
			$http.get('data/received-ratings.json')
		       .then(
		       		function(success) {
		       			// Convert dates
		       			var i;
		       			for (i=0; i<success.data.length; i++) {
		       				success.data[i].date = new Date((success.data[i].date || "").replace(/-/g,"/").replace(/[TZ]/g," "));
		       			}

						hasLoadedReceivedRatings.value=true;
		       			var receivedRatings = success.data;
		       			if (receivedRatings.length) {
			       			loggedInUser.receivedRatings = toValueSet(receivedRatings);
		       			} else {
			       			loggedInUser.receivedRatings = {empty:true};
		       			}
			       		if (cb) {
			       			cb(true);
			       		}
		       		},
		       		function(error) {
						hasLoadedReceivedRatings.value=true;
		       			console.log("Could not retrieve received ratings");
		       			if (cb) {
		       				cb(false);
		       			}
		       		}
		   	);
		},
		loadNotificationsAmount = function(cb) {
			$http.get('data/received-ratings-amount.json')
		       .then(
		       		function(success) {
		       			if (loggedInUser && success.data.length) {
			       			loggedInUser.notificationsAmount = success.data[0].notificationsAmount;
		       			}
			       		if (cb) {
			       			cb(true);
			       		}
		       		},
		       		function(error) {
		       			console.log("Could not retrieve notifications amount");
			       		if (cb) {
			       			cb(false);
			       		}
		       		}
		   	);
		},
		loadProfile = function(cb) {
			$http.get('data/user-score.json')
		       .then(
		       		function(success) {
		       			if (success.data && success.data.length > 0) {
			       			loggedInUser.score = success.data[0].ratingsAmount;
		       			}
		       		},
		       		function(error) {
		       			console.log("Could not retrieve user score");
		       		}
		   	);
	       loadUserJokes();
		},
		// logOut = function() {
		// 	loggedInUser = {};
		// },
		getUser = function() {
			return loggedInUser;
		},
		getUserId = function() {
			return loggedInUser.id;
		};
			
	checkLoggedIn();

	return {
		checkLoggedIn: checkLoggedIn,
		userLogin: userLogin,
		login: login,
		register: register,
		modifyPassword: modifyPassword,
		modifyAdult: modifyAdult,
		resetPassword: resetPassword,
		loadProfile: loadProfile,
		loadUserJokes: loadUserJokes,
		loadUserRatings: loadUserRatings,
		loadReceivedRatings: loadReceivedRatings,
		hasLoadedUserJokes: hasLoadedUserJokes,
		hasLoadedUserRatings: hasLoadedUserRatings,
		hasLoadedReceivedRatings: hasLoadedReceivedRatings,
		loadNotificationsAmount: loadNotificationsAmount,
		getUser: getUser,
		getUserId: getUserId
	};

}]);