/*global app, console,$*/
app.factory('tooltips', function() {
    'use strict';
    var activateTooltips = function() {
      $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });  
    };

    return {
        activateTooltips: activateTooltips
    };
});
