/*global app, console, window*/
app.factory('datamuse', ['$http', function($http) {
    'use strict';
    var baseUrl = "http://api.datamuse.com/words?",
        toList = function(data) {
            var idx,
                result = [];
            for (idx = 0; idx < data.length; idx+=1) {
                result.push(data[idx].word);
            }
            return result;
        },
        getFrequency = function(word) {
            var idx, tag;
            if (!word.tags || !word.tags.length) {
                console.log("Not found frequency of", word);
                return 1;
            }
            for (idx=0; idx<word.tags.length; idx+=1) {
                tag = word.tags[idx];
                if (tag.startsWith("f:")) {
                    return parseInt(tag.substring(2));
                }
            }
        },
        getInverseFrequency = function(word) {
            var freq = getFrequency(word);
            if (freq===0) {
                return 1;
            }
            return 1/freq;
        },
        calculateScoreSum = function(data) {
            var idx, sum = 0;
            for (idx = 0; idx < data.length; idx+=1) {
                sum += data[idx].score;
            }
            return sum;
        },
        calculateInverseFrequencySum = function(data) {
            var idx, sum = 0;
            for (idx = 0; idx < data.length; idx+=1) {
                sum += getInverseFrequency(data[idx]);
            }
            return sum;
        },
        getRandomDouble = function(max) {
            return Math.random() * max;
        },
        getRandomInt = function(max) {
            return Math.floor(Math.random() * max);
        },
        pickRandom = function(data) {
            var randomIdx = getRandomInt(data.length-1);
            return data[randomIdx];
        },
        pickRandomWeighted = function(data) {
            var scoreSum = calculateScoreSum(data),
                randomWeight = getRandomInt(scoreSum),
                totalCurrentWeight = 0,
                idx;

            for (idx=0; idx<data.length; idx+=1) {
                totalCurrentWeight+=data[idx].score;
                if (randomWeight<=totalCurrentWeight) {
                    return data[idx];
                }
            }
            console.log("Error picking random");
            return "Error in picking random";
        },
        pickRandomInverseFrequency = function(data) {
            var frequencySum = calculateInverseFrequencySum(data),
                randomWeight = getRandomDouble(frequencySum),
                totalCurrentWeight = 0,
                idx;

            // console.log("freqsum",randomWeight,"/",frequencySum);


            for (idx=0; idx<data.length; idx+=1) {
                totalCurrentWeight+=getInverseFrequency(data[idx]);
                if (randomWeight<=totalCurrentWeight) {
                    return data[idx];
                }
            }
            console.log("Error picking random");
            return "Error in picking random";
        },
        getNouns = function(data) {
            var idx, filtered = [];
            
            for (idx=0; idx<data.length;idx+=1) {
                if (data[idx].tags && data[idx].tags.indexOf("n") >= 0 && data[idx].tags.length==2) {
                    filtered.push(data[idx]);
                }
            }
            return filtered;
        },
        getAdjectives = function(data) {
            var idx, filtered = [];
            
            for (idx=0; idx<data.length;idx+=1) {
                if (data[idx].tags && data[idx].tags.indexOf("adj") >= 0 && data[idx].tags.length==2) {
                    filtered.push(data[idx]);
                }
            }
            return filtered;
        },
        callDatamuse = function(type, word, cb) {
            return $http.get(baseUrl+type+"="+word+"&md=pf&max=1000")
                .then(
                    function(success) {
                            cb(success.data);
                        },
                    function(error) {
                            cb(false);
                        }
                    );
        },
        getWordRightOf = function(word, cb) {
            return callDatamuse("lc", word, function(data) {    
                cb(data);
            })
        },
        getWordLeftOf = function(word, cb) {
            return callDatamuse("rc", word, function(data) {    
                cb(data);
            })
        },
        getRelatedAdjective = function(noun, cb) {
            return callDatamuse("rel_jjb", noun, function(data) {
                cb(data);
            })
        },
        getRelatedNoun = function(adj, cb) {
            return callDatamuse("rel_jja", adj, function(data) {
                cb(data);
            })
        };


    return {
        toList: toList,
        getWordRightOf: getWordRightOf,
        getWordLeftOf: getWordLeftOf,
        pickRandom: pickRandom,
        pickRandomWeighted: pickRandomWeighted,
        pickRandomInverseFrequency: pickRandomInverseFrequency,
        getNouns: getNouns,
        getAdjectives: getAdjectives,
        getRelatedAdjective: getRelatedAdjective,
        getRelatedNoun: getRelatedNoun
    };
}]);