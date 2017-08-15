// Code from https://github.com/tj/node-pwd

/**
 * Module dependencies.
 */

var crypto = require('crypto');

/**
 * Bytesize.
 */

var len = 128;

/**
 * Iterations. ~300ms
 */

var iterations = 12000;

/**
 * Hashes a password with optional `salt`, otherwise
 * generate a salt for `pass` and invoke `fn(err, salt, hash)`.
 *
 * @param {String} password to hash
 * @param {String} optional salt
 * @param {Function} callback
 * @api public
 */

exports.hash = function (pwd, salt, fn) {
  if (3 ==arguments.length) {
    crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash){
      fn(err, hash.toString('base64'));
    });
  } else {
    fn = salt;
    crypto.randomBytes(len, function(err, salt){
      if (err) return fn(err);
      salt = salt.toString('base64');
      crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash){
        if (err) return fn(err);
        fn(null, salt, hash.toString('base64'));
      });
    });
  }
};





// GENERATION OF PASSWORDS

var _pattern = /[a-zA-Z0-9_\-\+\.]/,
  _getRandomByte = function() {
    // http://caniuse.com/#feat=getrandomvalues
    if(global.crypto && global.crypto.getRandomValues) 
    {
      var result = new Uint8Array(1);
      global.crypto.getRandomValues(result);
      return result[0];
    }
    else if(global.msCrypto && global.msCrypto.getRandomValues) 
    {
      var result = new Uint8Array(1);
      global.msCrypto.getRandomValues(result);
      return result[0];
    }
    else
    {
      return Math.floor(Math.random() * 256);
    }
  };
  
exports.generate = function(length) {
    return Array.apply(null, {'length': length})
      .map(function()
      {
        var result;
        while(true) 
        {
          result = String.fromCharCode(_getRandomByte());
          if(_pattern.test(result))
          {
            return result;
          }
        }        
      }, this)
      .join('');  
  }    
;