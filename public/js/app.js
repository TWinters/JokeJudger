/*global angular,array,console,$,taOptions*/
var app = angular.module('JokeJudger', ['ngRoute', 'ngSanitize','ui.bootstrap', 'angular.filter','yaru22.angular-timeago']);
app.config(function ($routeProvider) { 
    'use strict';
    $routeProvider 
      .when('/', { 
        redirectTo: 'rate'
      })
      .when('/rate', { 
        controller: 'RateController', 
        templateUrl: 'views/rate.html' 
      })
      .when('/create', { 
        controller: 'CreateController', 
        templateUrl: 'views/create.html' 
      })
      .when('/bulk', { 
        controller: 'BulkCreateController', 
        templateUrl: 'views/bulk-create.html' 
      })
      .when('/register', { 
        controller: 'RegisterController', 
        templateUrl: 'views/register.html' 
      })
      .when('/login', { 
        controller: 'LoginController', 
        templateUrl: 'views/login.html' 
      })
      .when('/login-:info', { 
        controller: 'LoginController', 
        templateUrl: 'views/login.html' 
      })
      .when('/modify-password', { 
        controller: 'ModifyPasswordController', 
        templateUrl: 'views/modify-password.html' 
      })
      .when('/reset-password', { 
        controller: 'ResetPasswordController', 
        templateUrl: 'views/reset-password.html' 
      })
      .when('/profile', { 
        controller: 'ProfileController', 
        templateUrl: 'views/profile.html' 
      })
      .when('/user-jokes', { 
        controller: 'UserJokesController', 
        templateUrl: 'views/user-jokes.html' 
      })
      .when('/user-ratings', { 
        controller: 'UserRatingsController', 
        templateUrl: 'views/user-ratings.html' 
      })
      .when('/joke-overview', { 
        controller: 'JokeOverviewController', 
        templateUrl: 'views/joke-overview.html' 
      })
      .when('/hall-of-fame', { 
        controller: 'BestJokesController', 
        templateUrl: 'views/hall-of-fame.html' 
      })
      .when('/notifications', { 
        controller: 'ReceivedRatingsController', 
        templateUrl: 'views/received-ratings.html' 
      })
      .when('/about', {
        templateUrl: 'views/about.html' 
      });
});

app.config(['$locationProvider', function($locationProvider) {
  // $locationProvider.html5Mode(false);
  $locationProvider.hashPrefix('');
}]);

app.filter('nl2p', function () {
   'use strict';
    return function(text){
        text = String(text).trim();
        return (text.length > 0 ? '<p>' + text.replace(/[\r\n]+/g, '</p><p>') + '</p>' : null);
    };
});

app.filter('nlToArray', function() {
  'use strict';
  return function(text) {
      return text && text.split('\n');
  };
});

app.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);



angular.element(document.body).bind('click', function (e) {
    var popups = document.querySelectorAll('.popover');
    if(popups) {
        for(var i=0; i<popups.length; i++) {
            var popup = popups[i];
            var popupElement = angular.element(popup);

            if(popupElement[0].previousSibling!=e.target){
                popupElement.scope().$parent.isOpen=false;
                popupElement.remove();
            }
        }
    }
});


// Google charts
google.charts.load('current', {packages: ['corechart', 'bar']});