/*global app, console, window*/
app.factory('generator', ['$http', '$q', 'datamuse', function($http, $q, datamuseService) {
    'use strict';
    var generator = {},
        loadGenerator = function() {
          return $http.get("/data/generator.json")
          .then(function(success) {
                generator=success.data;
             },function(error) {
                console.log('Error loading generator', error);
             }
           );
        },
        getGenerator = function() {
          return generator;
        },
        // Picks a random item from a list
        pick = function(items) {
            if (!items || !items.length) {
                console.log("No length", items);
            }
            return items[Math.floor(Math.random()*items.length)];
        },

        // Picks some word from the conventional generator
        pickOther = function() {
            var generator = getGenerator(),
                otherWordNumber = Math.random();
            if (otherWordNumber < 0.67) {
                return pick(generator.thing);   
            } else if (otherWordNumber < 0.83) {
                return pick(generator.job); 
            } else if (otherWordNumber < 0.87) {
                return pick(generator.event); 
            } else if (otherWordNumber < 0.91) {
                return pick(generator.genre); 
            } else {
                return pick(generator.location);                 
            }
        },
        getRelatedNouns = function(noun) { 
          var deferred = $q.defer();
          var nouns = ["test"];
          datamuseService.getWordLeftOf(noun, function(adjData) {
             var adjectives = datamuseService.getAdjectives(adjData),
                  amountOfAdjectivesHandled = 0,
                  i,j;

            for(i=0; i<adjectives.length; i+=1) {
              datamuseService.getWordRightOf(adjectives[i].word, function(nounData){
                for (j=0; j<nounData.length; j+=1) {
                  nouns.push(nounData[j]);
                }
                amountOfAdjectivesHandled += 1;
                if (amountOfAdjectivesHandled >= adjectives.length) {
                  deferred.resolve(nouns);                  
                }
              })
            }

                     
          });

          return deferred.promise;

        },

        generateRelatedNoun = function(noun, weight, cb) {
            datamuseService.getWordLeftOf(noun, function(adjData) {
                    // Assign adjective

                    var adjectives = datamuseService.getAdjectives(adjData),
                        randomAdjObj, randomAdj;


                    // console.log("Adjectives",adjectives,randomAdjObj);
                    randomAdjObj = datamuseService.pickRandom(adjectives);
                    if (!randomAdjObj || !randomAdjObj.word) {
                        return cb({err:"No adjectives for " + noun});
                    }
                    randomAdj = randomAdjObj.word;


                    datamuseService.getRelatedNoun(randomAdj, function(nounData) {
                        // Assign first noun
                        var nouns = datamuseService.getNouns(nounData),
                            randomNounObj, randomNoun;
                        
                        if (nouns.length>0) {
                            randomNounObj = datamuseService.pickRandomInverseFrequency(nouns);
                            randomNoun = randomNounObj.word;

                            if (weight<=0) {
                                // console.log(noun,"->",randomAdj,"->",randomNoun,". END.");
                                cb({y:randomNoun, z:randomAdj});
                            } else {
                                // console.log(noun,"->",randomAdj,"->",randomNoun);
                                generateRelatedNoun(randomNoun, weight-1,cb);
                            }
                        } else {
                            cb({err:"No nouns for " + randomAdj});                     
                        }
                });


            });
        },
        getAllX = function(cb) {
          var startLeftContext, randomNumber = Math.random();

            if (randomNumber < 0.6) {
                startLeftContext = "my";
            } else if (randomNumber < 0.85) {
                startLeftContext = "your";
            } else {
                startLeftContext = "our";
            }

            datamuseService.getWordRightOf(startLeftContext, function(xData) {
                cb(xData);
            });

        },
        generateRandomX = function(cb) {
          getAllX(function(xData) {
              var x = datamuseService.pickRandomWeighted(datamuseService.getNouns(xData)).word;
              cb(x);
          });

        },
        generateDatamuseChallenge = function(cb) {
            generateRandomX(function(x) {

                generateRelatedNoun(x,2, function(data) {
                    if (!data.err) {
                        data.x = x;
                        if (Math.random() < 0.66) {
                            data.z = "";
                        } else {
                            data.x = "";
                            if (Math.random() < 0.5) {
                                data.z = "";
                            }
                        }
                    }
                    cb(data);
                });
            });
        },
        generateJSONChallenge = function(cb) {
            var generator = getGenerator(),
                closeNumber = Math.random(),
                x,y,z;

            x = "";
            y = "";
            z = "";

            if (closeNumber < 0.75) {
                x = pick(generator.close);
            } else if (closeNumber < 0.88) {
                x = pickOther();
            }
            y = pickOther();

            // console.log("Generated JSON challenge");
            cb({x:x,y:y,z:z});

        },
        generateChallenge = function(joke, callback) {
            if (Math.random() < 0.85) {
                generateDatamuseChallenge(function(data) {
                    if (data.err) {
                        console.log("Datamuse error:",data.err);
                        generateJSONChallenge(callback);
                    } else {
                        callback(data);                        
                    }
                });
            } else {
                generateJSONChallenge(callback);
            }
        },
        sortAndUnique = function(arr) {
            if (!arr || arr.length === 0) return arr;
            arr = arr.sort();
            var ret = [arr[0]];
            for (var i = 1; i < arr.length; i++) { // start loop at 1 as element 0 can never be a duplicate
                if (arr[i-1] !== arr[i]) {
                    ret.push(arr[i]);
                }
            }
            return ret;
        },
        filterContaining = function(arr, substring) {
            var idx;
            if (!substring || substring === "") {
                return;
            }
            for (idx=0; idx<arr.length; idx+=1) {
                if (arr[idx].indexOf(substring) < 0) {
                    arr.splice(idx,1);
                    idx--;
                }
            }
        },
        getSuggestionsXY = function(xORy, joke, dontFilterContaining) {
            var deferred = $q.defer();

            if (joke.z) {
                datamuseService.getWordRightOf(joke.z ||"", function(nounDataZ) {
                    if (nounDataZ.err) {
                        // error callback
                        deferred.reject(err);
                    } else {
                        var total = datamuseService.toList(datamuseService.getNouns(nounDataZ));
                        total = sortAndUnique(total);
                        if (!dontFilterContaining) {
                          filterContaining(total, joke[xORy] || "");
                        }
                        deferred.resolve(total);

                    }
                });
            } else {
                var other;
                if (xORy === "x") {
                    other = "y";
                } else {
                    other = "x"
                }

                if (joke[other]) {
                    getRelatedNouns(joke[other]).then(function(nounData) {
                        if (nounData.err) {
                            // error callback
                            deferred.reject(nounData.err);
                        } else {
                            var total = datamuseService.toList(datamuseService.getNouns(nounData));
                            total = sortAndUnique(total);
                            if (!dontFilterContaining) {
                              filterContaining(total, joke[xORy] || "");                              
                            }
                            deferred.resolve(total);
                        }
                    })
                } else {
                  getAllX(function(x) {
                    deferred.resolve(datamuseService.toList(x));
                  })
                }
            }
            return deferred.promise;
        },
        getSuggestionsZ = function(joke, dontFilterContaining) {
            var deferred = $q.defer();

            datamuseService.getWordLeftOf(joke.x ||"", function(adjDataX) {
                datamuseService.getWordLeftOf(joke.y ||"", function(adjDataY) {
                    if (adjDataX.err || adjDataY.err) {
                        // error callback
                        deferred.reject(err);

                    } else {

                        var listX = datamuseService.toList(datamuseService.getAdjectives(adjDataX)),
                            listY = datamuseService.toList(datamuseService.getAdjectives(adjDataY)),
                            total = [];

                        total.extend(listY);
                        total.extend(listX);
                        total = sortAndUnique(total);
                        if (!dontFilterContaining) {
                          filterContaining(total, joke.z || "");                          
                        }
                        deferred.resolve(total);

                    }
                });
            });
            return deferred.promise;
        },

        randomizeX = function(joke,cb) {
          getSuggestionsXY("x",joke, true).then(function(data,) {
            if (data.length) {
              joke.x = pick(data);
            } else {
              joke.x = pickOther();
            }
            cb(true);
          });
        },
        randomizeY = function(joke,cb) {
          getSuggestionsXY("y",joke, true).then(function(data) {
            if (data.length) {
              joke.y = pick(data);
            } else {
              joke.y = pickOther();
            }
            cb(true);
          });
        },
        randomizeZ = function(joke,cb) {
          getSuggestionsZ(joke, true).then(function(data) {
            joke.z = pick(data);
          });
          cb(true);
        };

    loadGenerator();


    return {
        generateChallenge: generateChallenge,
        getSuggestionsXY: getSuggestionsXY,
        getSuggestionsZ: getSuggestionsZ,
        randomizeX: randomizeX,
        randomizeY: randomizeY,
        randomizeZ: randomizeZ
    };
}]);