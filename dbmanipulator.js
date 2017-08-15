/*global require, exports,console,process*/
var mysql = require('mysql');
var hash = require('./pass').hash;

var connection;

if (process.env.MYSQL_URL) { //ON HEROKU {
    console.log("On Heroku");
    connection = mysql.createConnection({
        connectionLimit : 10,
        host        : process.env.MYSQL_HOST,
        user        : process.env.MYSQL_USERNAME,
        password    : process.env.MYSQL_PASSWORD,
        database    : process.env.MYSQL_DATABASE
    });
} else { // LOCAL
    console.log("Local");
    connection = mysql.createConnection({
        host        : "127.0.0.1",
        user        : "jokejudger",
        password    : "joke",
        database    : "jokejudger"
    });
}
                 
connection.connect(function(err){
    'use strict';
    if(err){
        console.log('Error connecting to Database');
        return;
    }
    console.log('Connection established');
});

exports.release = function() {
    'use strict';
    connection.end();
};

var MAX_ID = 100000000;

// This class serves as an adaptor to the sqlite library
var isFunction = function(functionToCheck) {
        'use strict';
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    },
    isInt = function(value) {
        'use strict';
        return !isNaN(value) && 
                parseInt(Number(value),10) === value && 
                !isNaN(parseInt(value, 10));
    },
    isString = function(myVar) {
        'use strict';
        return typeof myVar === 'string' || myVar instanceof String;
    },
    prepare = function(query) {
        'use strict';
        var run = function() {
            var cb = arguments[arguments.length-1],
                hasCb = isFunction(cb),
                args = Array.from(arguments);

            connection.query(query, args, function(err, rows) {
                if (err) {
                    cb(err);
                    throw err;
                }
                if (hasCb) {
                    if (!rows || !rows.length) {
                        cb(null,[]);
                    } else {            
                        cb(null, rows);
                    }
                }
            });         
        };
        return {
            run: run,
            all: run
        };
    },
    getNowDate = function() {
        return toSqlDate(new Date());
    },
    toSqlDate = function(date) {
        'use strict';
        if (isInt(date) || isString(date)) {
            date = new Date(date);
            date = new Date(date.getTime()-date.getTimezoneOffset()*60000);
        }
        return date.toISOString().slice(0, 19).replace('T', ' ');
    },
    toJavascriptDate = function(dateString) {
        'use strict';
        // Split timestamp into [ Y, M, D, h, m, s ]
        var t = dateString.split(/[\- :]/),
            // Apply each element to the Date function
            date = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
            // convert to msec and create utc
            //utc = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));


        return date;
    },
    checkExistance = function(err, data, cb) {
        'use strict';
        if (err) {
            throw err;
        }
        if (data.length) {
            cb(true);
        } else {
            cb(false);
        }
    },
    getRandomId = function(max) {
        'use strict';
        return Math.floor(Math.random()*(max || MAX_ID))+1;
    };


var // =====================
    // ====== SETTERS ======
    // =====================

    insertJokeIdPs = prepare("insert into jokes(id,x,y,z) values (?,?,?,?)"),
    insertRatingPs = prepare("insert ignore into ratings(score, user_id, joke_id, date) values (?,?,?,?)"),
    insertOffensiveMarkPs = prepare("insert ignore into markings(offensive, user_id, joke_id, date) values (TRUE,?,?,?)"),
    insertIncomprehensiveMarkPs = prepare("insert ignore into markings(incomprehensive, user_id, joke_id, date) values (TRUE,?,?,?)"),
    updateRatingPs = prepare("update ratings set score = ?, date = ? where (user_id = ? and joke_id = ?);"),
    insertUserIdPs = prepare("insert into users(id,mail,hash,salt,native_english,date_joined) values (?,?,?,?,?,?)"),
    updateUserPasswordPs = prepare("update users set salt = ?, hash = ? where id = ?;"),
    insertJokeCreationPs = prepare("insert ignore into jokecreations(user_id,joke_id,date_added,removed) values (?,?,?,0)"),
    updateLastNotificationsCheckPs = prepare("UPDATE users SET last_notifications_check = ? WHERE id = ?;"),
    updateUserAdultPs = prepare("UPDATE users SET adult = ? WHERE id = ?;"),
    updateJokeOffensivePs = prepare("UPDATE jokes SET offensive = ? WHERE id = ?;"),

    // =====================
    // ====== GETTERS ======
    // =====================

    // USER
    getUserIdPs = prepare("select * from users where id = ?"),
    getUserMailPs = prepare("select * from users where mail = ?"),

    // JOKE
    // getJokesPs = prepare("SELECT id,x,y,z FROM jokes AS j WHERE EXISTS(SELECT * FROM jokecreations as c WHERE c.joke_id=j.id and c.removed = 0)"),
    getJokesPs = prepare("SELECT id,x,y,z, COUNT(r.joke_id) as ratingsAmount FROM jokes AS j LEFT JOIN ratings AS r ON r.joke_id=j.id "
    + "WHERE EXISTS (SELECT * FROM jokecreations as c WHERE c.joke_id=j.id and c.removed = 0) "
    + "GROUP BY j.x,j.y,j.z ORDER BY ratingsAmount;"),
    getGoodJokesPs = prepare("SELECT id,x,y,z, AVG(r.score) as averageScore FROM jokes AS j LEFT JOIN ratings AS r ON r.joke_id=j.id "
    + "WHERE EXISTS (SELECT * FROM jokecreations as c WHERE c.joke_id=j.id and c.removed = 0) AND j.offensive=0 "
    + "AND (SELECT COUNT(*) FROM ratings AS r WHERE r.joke_id = j.id) >= 3 "
    + "GROUP BY j.x,j.y,j.z "
    + "ORDER BY averageScore DESC "
    + "LIMIT 10;"),
    getBestJokesSincePs = prepare("SELECT id,x,y,z, AVG(r.score) as averageScore FROM jokes AS j LEFT JOIN ratings AS r ON r.joke_id=j.id "
    + "WHERE EXISTS (SELECT * FROM jokecreations as c WHERE c.joke_id=j.id AND c.removed = 0 AND date_added > ?) AND j.offensive=0 "
    + "AND (SELECT COUNT(*) FROM ratings AS r WHERE r.joke_id = j.id) >= 2 "
    + "GROUP BY j.x,j.y,j.z "
    + "ORDER BY averageScore DESC "
    + "LIMIT 5;"),

    getAllJokesWithMarkingsPs = prepare(
        "SELECT j.id, j.x, j.y, j.z, j.offensive, SUM(m.offensive) as offensiveCount, SUM(m.incomprehensive) as incomprehensiveCount, MIN(c.date_added) as dateAdded "
        +"FROM jokes AS j LEFT JOIN markings AS m ON j.id=m.joke_id LEFT JOIN jokecreations AS c on j.id=c.joke_id "
        +"GROUP BY j.id, j.x, j.y, j.z;"),


    // Jokes to rate for user:
    getJokesForUserIdPs = prepare(
        "SELECT id,x,y,z, COUNT(r.joke_id)+COUNT(m.joke_id) as ratingsAmount "
        + "FROM jokes AS j "
        + "LEFT JOIN ratings AS r ON r.joke_id=j.id "
        + "LEFT JOIN markings AS m ON m.joke_id=j.id "
        + "WHERE "
        + "j.offensive<=? "
        + "AND EXISTS (SELECT * FROM jokecreations AS c WHERE c.joke_id=j.id and c.removed = 0) "
        + "AND NOT EXISTS (SELECT * FROM jokecreations AS c WHERE user_id = ? AND c.joke_id = j.id) "
        + "AND NOT EXISTS (SELECT * FROM ratings AS r WHERE user_id = ? AND r.joke_id = j.id) "
        + "AND NOT EXISTS (SELECT * FROM markings AS m WHERE user_id = ? AND m.joke_id = j.id) "
        + "GROUP BY j.x,j.y,j.z "
        + "ORDER BY ratingsAmount;"),
    // getJokesForUserIdPs = prepare("select * from jokes as j where not exists (select * from jokecreations as c where user_id = ? and c.joke_id = j.id) and not exists (select * from ratings as r where user_id = ? and r.joke_id = j.id);"),
    getJokeIdPs = prepare("select * from jokes where id = ?"),
    getJokeXYZPs = prepare("select * from jokes where x = ? and y = ? and z = ?"),
    getJokeRatedUserIdPs = prepare("SELECT id,x,y,z, SUM(r.score) as totalStars, COUNT(r.score) as ratingsAmount FROM jokes AS j LEFT JOIN ratings AS r ON j.id=r.joke_id WHERE EXISTS (SELECT * FROM jokecreations AS c WHERE c.joke_id = j.id AND c.user_id = ?) GROUP BY j.id;"),

    getJokeRatingsUserIdPs = prepare(
        "SELECT id,x,y,z, "
            + "GROUP_CONCAT(r.score, ';', r.date ORDER BY r.score) AS score, "
            + "AVG(r.score) as averageRating, "
            + "COUNT(r.user_id) as amountOfRatings, "
            + "COUNT(m.user_id) as amountOfMarks, "
            + "SUM(m.offensive) as amountOffensives, "
            + "SUM(m.incomprehensive) as amountIncomprehensives "
        + "FROM jokes AS j "
            + "LEFT JOIN ratings AS r ON j.id=r.joke_id "
            + "LEFT JOIN markings AS m ON j.id=m.joke_id "
        + "WHERE EXISTS (SELECT * "
            + "FROM jokecreations AS c "
            + "WHERE c.joke_id = j.id AND c.user_id = ?) "
        + "GROUP BY j.id;"),

    getUserRatingsIdPs = prepare(
        "SELECT id,x,y,z,score "
        + "FROM jokes AS j "
            + "LEFT JOIN ratings AS r ON j.id=r.joke_id "
        + "WHERE r.user_id = ?"),
    getUserMarkingsIdPs = prepare(
        "SELECT id,x,y,z,m.offensive,m.incomprehensive "
        + "FROM jokes AS j "
            + "LEFT JOIN markings AS m ON j.id=m.joke_id "
        + "WHERE m.user_id = ?"),
    getReceivedRatingsPs = prepare(
        "SELECT j.id,x,y,z,r.score,r.date "
        + "FROM jokes AS j "
            + "INNER JOIN ratings AS r ON j.id=r.joke_id "
        + "WHERE EXISTS(SELECT * FROM jokecreations as c WHERE c.joke_id = j.id AND c.user_id = ?) "
        + "ORDER BY r.date DESC"),
    getReceivedRatingsAmountPs = prepare(
        "SELECT COUNT(*) as notificationsAmount "
        + "FROM ratings AS r "
        + "WHERE EXISTS(SELECT * FROM jokecreations as c WHERE c.joke_id = r.joke_id AND c.user_id = ?) "
        + "AND r.date > (SELECT last_notifications_check FROM users AS u WHERE u.id = ?) "
        + "ORDER BY r.date DESC"),

    // JOKE CREATION
    getJokeCreationsUserIdPs = prepare("select * from jokecreations where user_id = ?"),
    getJokeCreationUserIdJokeIdPs = prepare("select * from jokecreations where user_id = ? and joke_id=?"),

    // JOKE RATINGS
    getRatingsUserIdPs = prepare("select * from ratings where user_id = ?"),
    getRatingsJokeIdPs = prepare("select * from ratings where joke_id = ?"),
    getRatingUserIdJokeIdPs = prepare("select * from ratings where user_id = ? and joke_id=?"),
    getRatingsAmountUserIdPs = prepare("select COUNT(*) as ratingsAmount from ratings where user_id = ?");









exports.addUser = function(mail,password,native_english, cb) {
    'use strict';
    mail = mail.toLowerCase().trim();
    exports.getUnusedUserId(function(id) {
        // Check if password is fine
        if (!password || password.length <= 0) {
            console.log("Invalid password for ", mail);
            return cb(false);
        }

        // Get mail
        mail = mail && mail.toLowerCase().trim();

        // Check if mail exists
        getUserMailPs.run(mail, function(err, data) {
            if (err) {
                console.log("Error when getting user with mail:",err);
                throw err;
            }
            if (data && data.length) {
                // It exists, return!
                return cb(true, "An account with this mailaddress already exists");
            }

            // Hash password
            hash(password, function(error, salt, hashed) {
                if (error) {
                console.log("Error when hashing password:",err);
                    throw error;
                }
        
                insertUserIdPs.run(id,mail,hashed,salt,native_english,getNowDate(), true, function(err) {
                    if (err){
                        return cb(false);
                    }
                    return cb(false, id);                
                });
            });
        });
    });
};

exports.addUserObject = function(data, cb) {
    'use strict';
    exports.addUser(data.mail,data.password,!!data.nativeEnglish, cb);
};


exports.setUserPassword = function(userId, password, cb) {
    'use strict';

    hash(password, function(error, salt, hashed) {
        if (error) {
            throw error;
        }

        updateUserPasswordPs.run(salt, hashed, userId, cb);
    });
};



exports.addJoke = function(x,y,z,userId, cb) {
    'use strict';
    // Check if exists
    exports.getJokeXYZ(x, y, z, function(err, existingJoke) {
        if (err) {
            throw err;
        }

        if (existingJoke && existingJoke.length > 0) {
            var joke = existingJoke[0];
            console.log("Joke already exists",joke);
            // Insert joke creation

            insertJokeCreationPs.run(userId,joke.id,getNowDate(), cb);
        } else {
            // Find unused joke id
            exports.getUnusedJokeId(function(jokeId) {
                // Insert joke
                insertJokeIdPs.run(jokeId,x,y,z, function(err,data) {
                    if (err) {
                        console.log("Error inserting joke",err);
                        throw err;
                    }
                    // Insert joke creation
                    insertJokeCreationPs.run(userId,jokeId,getNowDate(), cb);
                });
            });

        }

    });

};

exports.addJokeObject = function(data, cb) {
    'use strict';
    console.log("Adding joke:",data);
    if (data.x && data.y && data.z) {
        exports.addJoke(data.x,data.y,data.z,data.user_id, cb);        
    } else {
        cb(false,"Joke not specified");
    }
};



exports.addRating = function(rating, userId, jokeId, cb) {
    'use strict';
    exports.getRatingUserIdJokeId(userId, jokeId, function(err, existingRating) {
        if (err) {
            throw err;
        }

        if (existingRating && existingRating.length > 0) {
            console.log("joke is already rated",existingRating);
            updateRatingPs.run(rating, getNowDate(), userId, jokeId, cb);
        } else {
            insertRatingPs.run(rating, userId, jokeId, getNowDate(), cb);
        }
    });
};

exports.addRatingObject = function(data, cb) {
    'use strict';
    exports.addRating(data.rating, data.user_id, data.joke, cb);
};

exports.addOffensiveMarking = function(userId, jokeId, cb) {
    'use strict';
    insertOffensiveMarkPs.run(userId, jokeId, getNowDate(), cb);
};

exports.addOffensiveMarkingObject = function(data, cb) {
    'use strict';
    exports.addOffensiveMarking(data.user_id, data.joke, cb);
};

exports.addIncomprehensiveMarking = function(userId, jokeId, cb) {
    'use strict';
    insertIncomprehensiveMarkPs.run(userId, jokeId, getNowDate(), cb);
};

exports.addIncomprehensiveMarkingObject = function(data, cb) {
    'use strict';
    exports.addIncomprehensiveMarking(data.user_id, data.joke, cb);
};

exports.updateLastNotificationsCheck = function(userId, cb) {
    'use strict';
    updateLastNotificationsCheckPs.run(getNowDate(), userId, cb);
};

exports.updateUserAdult = function(adult, userId, cb) {
    'use strict';
    updateUserAdultPs.run(adult, userId, cb);
};
exports.updateUserAdultObject = function(data, cb) {
    'use strict';
    exports.updateUserAdult(data.adult, data.user_id, cb);
};

exports.updateJokeOffensive = function(jokeId, offensive, cb) {
    'use strict';
    updateJokeOffensivePs.run(offensive, jokeId, cb);
};
exports.updateJokeOffensiveObject = function(data, cb) {
    'use strict';
    exports.updateJokeOffensive(data.joke, data.offensive, cb);
};






// =====================
// ====== EXISTS ======
// =====================

// USER
exports.existsUserMail = function(mail, cb) {
    'use strict';
    exports.getUserMail(mail, function(err, data) {
        checkExistance(err, data, cb);
    });
};
exports.existsUser = function(id, cb) {
    'use strict';
    exports.getUserId(id, function(err, data) {
        checkExistance(err, data, cb);
    });
};
exports.getUnusedUserId = function(cb) {
    'use strict';
    var randomId = getRandomId();

    exports.existsUser(randomId, function(exists) {
        if (exists) {
            return exports.getUnusedUserId(cb);
        }
        return cb(randomId);
    });
};

// JOKE
exports.existsJokeId = function(id, cb) {
    'use strict';
    exports.getJokeId(id, function(err, data) {
        checkExistance(err, data, cb);
    });
};
exports.getUnusedJokeId = function(cb) {
    'use strict';
    var randomId = getRandomId();

    exports.existsJokeId(randomId, function(exists) {
        if (exists) {
            return exports.getUnusedJokeId(cb);
        }
        return cb(randomId);
    });
};

// JOKE CREATION
exports.existsJokeCreation = function(userId, jokeId, cb) {
    'use strict';
    getJokeCreationUserIdJokeIdPs.run(userId,jokeId, function(err, data) {
        checkExistance(err, data, cb);
    });
};





// GETTERS
exports.getJokes = function(cb) {
    'use strict';
    getJokesPs.all(cb);
};
exports.getGoodJokes = function(cb) {
    'use strict';
    getGoodJokesPs.all(cb);
};
exports.getBestJokesSince = function(date, cb) {
    'use strict';
    getBestJokesSincePs.all(toSqlDate(date), cb);
};


exports.getAllJokesWithMarkings = function(cb) {
    'use strict';
    getAllJokesWithMarkingsPs.all(cb);
};

exports.getJokesForUserId = function(user,cb) {
    'use strict';
    var userId = user.id;
    getJokesForUserIdPs.all(user.adult || 0,userId,userId,userId,cb);
};

exports.getJokeId = function(id,cb) {
    'use strict';
    getJokeIdPs.all(id,cb);
};
exports.getJokeXYZ = function(x,y,z, cb) {
    'use strict';
    getJokeXYZPs.all(x,y,z, cb);
};
exports.getJokeRatedUserId = function(userId, cb) {
    'use strict';
    getJokeRatedUserIdPs.all(userId, cb);
};
exports.getJokeRatingsUserId = function(userId, cb) {
    'use strict';
    getJokeRatingsUserIdPs.all(userId, function(err, rows, fields) {
        rows.forEach(function(row) {
            var ratings;
            if (!row.score) {
                ratings=[];
            } else {
                ratings = row.score && row.score.toString().split(',');
            }
            row.ratings = ratings.map(function(rating) {
                var data = rating.toString().split(';');
                return {
                    score: data[0],
                    date: data[1]
                }
            });
            if (row.amountOfRatings) {
                row.amountOffensives = row.amountOffensives/row.amountOfRatings;
                row.amountIncomprehensives = row.amountIncomprehensives/row.amountOfRatings;     
                row.amountOfMarks = row.amountOfMarks/row.amountOfRatings;                
            }
            delete row.score;
        });
        cb(err, rows, fields);
    });
};



exports.getUserId = function(id,cb) {
    'use strict';
    getUserIdPs.all(id,cb);
};
exports.getUserMail = function(mail,cb) {
    'use strict';
    getUserMailPs.all(mail,cb);
};
exports.getRatingUserIdJokeId = function(userId,jokeId,cb) {
    'use strict';
    getRatingUserIdJokeIdPs.all(userId,jokeId,cb);
};
exports.getRatingsAmountUserId = function(userId, cb) {
    'use strict';
    getRatingsAmountUserIdPs.all(userId, cb);
};
exports.getUserRatingsId = function(id,cb) {
    'use strict';
    getUserRatingsIdPs.all(id,cb);
};
exports.getUserMarkingsId = function(id,cb) {
    'use strict';
    getUserMarkingsIdPs.all(id,cb);
};

exports.getReceivedRatings = function(userId,cb) {
    'use strict';
    getReceivedRatingsPs.all(userId, cb);

};
exports.getReceivedRatingsAmount = function(userId,cb) {
    'use strict';
    getReceivedRatingsAmountPs.all(userId,userId, cb);

};

