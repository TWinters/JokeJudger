


/* Extensions */
Array.prototype.extend = function (other_array) {
    'use strict';
    var add = function(v) {
      this.push(v);
    };
    if (!angular.isArray(other_array)) {
      console.error('Not a valid array: ' + other_array);
    } else {
      other_array.forEach(add, this);   
    }
};
Array.prototype.remove = function (element) {
    'use strict';
    var index = this.indexOf(element);
    if (index > -1) {
        this.splice(index, 1);
    }
};
Array.prototype.contains = function (element) {
    'use strict';
    return this.indexOf(element) > -1;
};




function extendObject() {
  'use strict';
    // Variables
    var extended = {},
        deep = false,
        i = 0,
        length = arguments.length;

    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
        deep = arguments[0];
        i+=1;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
        for ( var prop in obj ) {
            if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                // If deep merge and property is an object, merge properties
                if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                    extended[prop] = extendObject( true, extended[prop], obj[prop] );
                } else {
                    extended[prop] = obj[prop];
                }
            }
        }
    };

    // Loop through each object and conduct a merge
    for ( ; i < length; i++ ) {
        var obj = arguments[i];
        merge(obj);
    }

    return extended;

}




