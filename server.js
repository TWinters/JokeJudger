/*jslint nomen: true, node: true, todo: true*/
/*global require,negotiate,console,__dirname*/

var port = 5000,
	debug = true;

// MODULES
var http = require('http');
var https = require('https');
var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var path = require('path');
var fs = require('fs');
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

// Local
var pass = require('./pass');
var hash = pass.hash;
var mailer = require('./mailer');
var dbm = require('./dbmanipulator');


// var privateKey  = fs.readFileSync('sslcert/jokejudger_com.key', 'utf8');
// var certificate = fs.readFileSync('sslcert/jokejudger_com.crt', 'utf8');

// var credentials = {key: privateKey, cert: certificate};



process.env.TZ = "GMT";


// FUNCTIONS
var checkFileExistance = function(directory, callback) {  
		'use strict';
	  	fs.stat(directory, function(err) {
		    if (err && err.errno === 34) {
		      	callback();
		    } else {
		      	callback(err);
		    }
	  	});
	},
	sendFile = function(filePath, resp) {
		'use strict';
		var fullPath = path.join(__dirname, filePath);
		checkFileExistance(fullPath, function(error) {
			if (error) {
				resp.end("File not found"+ (debug ? ': ' + fullPath : '.'));
			} else {
				resp.sendFile(fullPath);
			}
		});
	},
	// Check whether the browser accepts XHTML, and record it in the response.
	negotiate = function(req, resp, next) {
		'use strict';
	    var accepts = req.headers.accept && req.headers.accept.split(",");
	    if (accepts && accepts.indexOf("application/xhtml+xml") >= 0)  {
	    	// resp.acceptsXHTML = true;
	    }
	    next();
	},
    ends = function(string, extension) {
        'use strict';
        return string.indexOf(extension, string.length-extension.length) >= 0;
    },
	// Called by express.static.  Delivers response as XHTML when appropriate.
	deliverXHTML = function(resp, path) {
		'use strict';
	    if (ends(path,'.html') && resp.acceptsXHTML) {
	        resp.header("Content-Type", "application/xhtml+xml");
	    }
	},

    // General function to receive data and use it to do something in the database
    receiveData = function(req, res, permissionCheck, cb) {
        'use strict';

        var body = '';

        // Keep getting data in
        req.on('data', function (data) {
            body += data;
            // Check for too much data (1MB)
            if (body.length > 1e6) {
                req.connection.destroy();
            }
        });

        // Parse data and add
        req.on('end', function () {
            var data = JSON.parse(body);
            cb(data, function(err, reason) {
                if (err) {
                    console.log("Error:",err);
                    res.statusCode = 400;
                    res.send(reason + "");
                }
                if (!err && !res.statusCode) {
                    console.log("Success:",err);
                     // Respond with success
                    res.statusCode = 201;
                }         
                res.send();                      
            });
        });
    },
    alwaysTrue = function() {
        'use strict';
        return true;
    },
    readAndSend = function(res, dbCall, postProcessing) {
        'use strict';
        dbCall(function(err,data) {
            if (err) {
                throw err;
            }
            if (postProcessing) {
                data = postProcessing(data);
            }
            res.send(JSON.stringify(data));
        });   
    };



// APP

// Setup on right port
var app = express(),
	staticArguments = {
		setHeaders: deliverXHTML
	};
app.set('port', (process.env.PORT || port));

// 
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

// Cookie session
app.set('trust proxy', 1); // trust first proxy
app.use(cookieSession({
	name: 'session',
	secret: process.env.COOKIE_SECRET || 'sdfmlkjqeraer546698qsdf21lmqfklqsdflnj'
}));
app.use(flash());
// app.use(negotiate);

app.use(passport.initialize());
app.use(passport.session());




// Password
var isValidPassword = function (user, password, cb) {
    	'use strict';
    	hash(password, user.salt, function(err, hash) {
    	    if (err) {
    	    	return cb(false, err);
    	    }
    	    if (hash === user.hash) {
    	    	delete user.hash;
    	    	delete user.salt;
    	    	cb(true);
    	    } else {
    	    	cb(false);	    	
    	    }
      	});
    },
    isInt = function (value) {
        'use strict';
        return !isNaN(value) && 
             parseInt(Number(value),10) === value && 
             !isNaN(parseInt(value, 10));
    },
    deserializeUser = function(id, done) {
        'use strict';
        if (isInt(id)) {
            dbm.getUserId(id, function(err, users) {
                if (err) {
                    throw err;
                }
                if (!users || !users.length) {
                    done(null, false);
                } else {
                    var filteredUser = {id:users[0].id, mail:users[0].mail, dateJoined:users[0].date_joined, adult:users[0].adult, admin:users[0].admin};
                    done(err, filteredUser);
                }
            });
        } else {
            done(null, false);
        }
    };

passport.use(new LocalStrategy(function(mail, password, done) {
		'use strict';
		dbm.getUserMail(mail.toLowerCase().trim(), function (err, users) {
			var user = users[0];
		    if (err) { 
		    	return done(err);
		    }
            if (!user) {
                return done(null, false, { message: "Unknown mailadress " + mail });
            }
		    isValidPassword(user, password, function(isCorrect, err) {
		    	if (err) {
		    		throw err;
		    	}
		    	delete user.hash;
		    	delete user.salt;

		    	if (!isCorrect) {
		    		return done(null, false, { message: 'Incorrect password' });
		    	}
		    	return done(null, user);
		    });
		});
  	}
));

passport.serializeUser(function(user, done) {
	'use strict';
 	done(null, user.id);
});
 




// User Accounts

app.get('/logout', function(req, res){
    'use strict';
    req.logout();
    res.redirect('/');
});

passport.deserializeUser(deserializeUser);

app.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/#/login-fail' }));


app.post('/reset-password', function(req, res) {
    'use strict';
    receiveData(req, res, alwaysTrue, function(passwordData, cb) {
        console.log("Reseting password for", passwordData);
        if (passwordData.mail) {
            dbm.getUserMail(passwordData.mail, function (err, users) {
                if (err) {
                    console.log("Error resetting password",err);
                    return cb(true, "Database error");
                }
                if (!users || !users.length) {
                    res.statusCode = 400;
                    console.log("Unknown mailadress");
                    return cb(true, "Unknown mailadress");
                }
                var user = users[0],
                    newPassword = pass.generate(8);

                // Set password to new password                
                console.log("New pass", newPassword);
                dbm.setUserPassword(user.id, newPassword, function(err, data) {
                    if (err) {
                        return cb(true, "Error updating password");
                    }
                    res.statusCode = 200;
                    cb(null, "Success");
                    mailer.sendForgotPasswordMail(user, newPassword);
                    console.log("Succesfully resetted password for",passwordData.mail)
                    return;
                });
            });

        } else {
            cb(true, "No mail given");
        }

    });
});



app.post('/create-user', function(request, res) {
    'use strict';
    receiveData(request, res, alwaysTrue, function(registerData,cb) {
        dbm.existsUserMail(registerData.mail, function(exists) {
            if (exists) {
                cb(true, "User with mail address \""+registerData.mail+"\" already exists.");
            } else {
                dbm.addUserObject(registerData,function(err,addingUserData) {
                    var user = {id:addingUserData, mail:registerData.mail, password:registerData.password};
                    request.login(user, function (err) {
                        if ( ! err ) {
                            res.redirect('/#/rate');
                        } else {
                            //handle error
                            console.log("Error logging in:",addingUserData);
                            cb(err,"Unable to log in");
                        }
                    });
                    mailer.sendUserRequestMail(user);
                    
                });
            }

        });
    });
});


app.post('/modify-password', function(req, res) {
    'use strict';
    receiveData(req, res, alwaysTrue, function(passwordData, cb) {
        if (req.user && req.user.id) {
            dbm.getUserId(req.user.id, function (err, users) {
                if (err) {
                    throw err;
                }
                if (!users || !users.length) {
                    res.statusCode = 404;
                    return cb(true, "Unknown user");
                }
                var member = users[0];

                // Check previous password correctness
                if (passwordData.oldPassword) {
                    isValidPassword(member, passwordData.oldPassword, function(success) {
                        if (!success) {
                            res.statusCode = 401;
                            res.hasError = true;
                            return cb(true, "Incorrect current password");
                        }
                        dbm.setUserPassword(req.user.id, passwordData.password);
                        res.statusCode = 202;
                        return cb(null, null);
                    });
                } else {
                    res.statusCode = 401;
                    res.hasError = true;
                    return cb(true, "Missing current password");

                }
            });

        } else {
            cb(true, "No user logged in");
        }

    });
});




// DATA ACCESS

app.get('/data/logged-in-user.json', function(req, res) {
    'use strict';
    if (!req.user) {
        // res.redirect('/logout');
        res.send();
    } else {
        res.send(JSON.stringify(req.user));        
    }
    // res.send(JSON.stringify({id:1,name:"Thomas"}));
});

app.get('/data/jokes.json', function(req, res) {
    'use strict';
    readAndSend(res, function(cb) {
        if (req.user) {
            dbm.getJokesForUserId(req.user,cb);
        } else {
            dbm.getGoodJokes(cb);
        }
    });
});

// BEST JOKES
app.get('/data/jokes-week.json', function(req, res) {
    'use strict';
    readAndSend(res, function(cb) {
        var date = new Date();
        date.setDate(date.getDate() - 7);
        dbm.getBestJokesSince(date,cb);
    });
});
app.get('/data/jokes-month.json', function(req, res) {
    'use strict';
    readAndSend(res, function(cb) {
        var date = new Date();
        date.setMonth(date.getMonth() - 1);
        dbm.getBestJokesSince(date,cb);
    });
});

app.get('/data/jokes-all-time.json', function(req, res) {
    'use strict';
    readAndSend(res, function(cb) {
        dbm.getGoodJokes(cb);
    });
});
app.get('/data/all-jokes.json', function(req, res) {
    'use strict';
    readAndSend(res, function(cb) {
        if (req.user && req.user.admin) {
            dbm.getAllJokesWithMarkings(cb);            
        } else {
            cb(false);
        }
    });
});

app.get('/data/user-jokes.json', function(req, res) {
    'use strict';
    readAndSend(res, function(cb) {
        if (req.user) {
            // dbm.getJokeRatedUserId(req.user.id,cb);
            dbm.getJokeRatingsUserId(req.user.id,cb);
        } else {
            res.send();
        }
    });
});
app.get('/data/user-ratings.json', function(req, res) {
    'use strict';
    readAndSend(res, function(cb) {
        if (req.user) {
            dbm.getUserRatingsId(req.user.id,cb);
        } else {
            res.send();
        }
    });
});
app.get('/data/user-markings.json', function(req, res) {
    'use strict';
    readAndSend(res, function(cb) {
        if (req.user) {
            dbm.getUserMarkingsId(req.user.id,cb);
        } else {
            res.send();
        }
    });
});
app.get('/data/user-score.json', function(req, res) {
    'use strict';
    readAndSend(res, function(cb) {
        if (req.user) {
            dbm.getRatingsAmountUserId(req.user.id,cb);
        } else {
            res.send();
        }
    });
});
app.get('/data/received-ratings.json', function(req, res) {
    'use strict';
    readAndSend(res, function(cb) {
        if (req.user) {
            dbm.updateLastNotificationsCheck(req.user.id);
            dbm.getReceivedRatings(req.user.id,cb);
        } else {
            res.send();
        }
    });
});

app.get('/data/received-ratings-amount.json', function(req, res) {
    'use strict';
    readAndSend(res, function(cb) {
        if (req.user) {
            dbm.getReceivedRatingsAmount(req.user.id,cb);
        } else {
            res.send();
        }
    });
});

// Data manipulation

app.post('/rate', function(request, res) {
    'use strict';
    receiveData(request, res, alwaysTrue, function(data, cb) {
        if (request.user) {
            data.user_id =  request.user.id;
            dbm.addRatingObject(data,cb);            
        } else {
            res.statusCode=401;
            res.send("Not logged in");
        }
    });
});
app.post('/mark-joke-incomprehensive', function(request, res) {
    'use strict';
    receiveData(request, res, alwaysTrue, function(data, cb) {
        if (request.user) {
            data.user_id =  request.user.id;
            dbm.addIncomprehensiveMarkingObject(data,cb);            
        } else {
            res.statusCode=401;
            res.send("Not logged in");
        }
    });
});
app.post('/mark-joke-offensive', function(request, res) {
    'use strict';
    receiveData(request, res, alwaysTrue, function(data, cb) {
        if (request.user) {
            data.user_id =  request.user.id;
            dbm.addOffensiveMarkingObject(data,cb);            
        } else {
            res.statusCode=401;
            res.send("Not logged in");
        }
    });
});

// ADMIN ONLY: Sets joke official offensiveness status
app.post('/set-joke-offensive', function(request, res) {
    'use strict';
    receiveData(request, res, alwaysTrue, function(data, cb) {
        if (request.user && request.user.admin) {
            dbm.updateJokeOffensiveObject(data,cb);            
        } else {
            res.statusCode=401;
            res.send("Forbidden");
        }
    });
});


app.post('/modify-adult', function(request, res) {
    'use strict';
    receiveData(request, res, alwaysTrue, function(data, cb) {
        if (request.user) {
            data.user_id =  request.user.id;
            dbm.updateUserAdultObject(data,cb);            
        } else {
            res.statusCode=401;
            res.send("Not logged in");
        }
    });
});

app.post('/create', function(request, res) {
    'use strict';
    receiveData(request, res, alwaysTrue, function(data, cb) {
        if (request.user) {
            data.user_id =  request.user.id;
            dbm.addJokeObject(data,cb);            
        } else {
            res.statusCode=401;
            res.send("Not logged in");
        }
    });
});



// Show all the content in the public directory to everyone.
app.use(express['static'](path.join('.', 'icons'), staticArguments));
app.use(express['static'](path.join('.', 'public'), staticArguments));

// App listening
app.listen(app.get('port'), function() {
	'use strict';
  console.log('Node app is running on port', app.get('port'));
});
var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);