angular.module('UserStats').factory('Stats', function($http){
    return {
        getStats: function(successCallback,errorCallback){
            $http.get(url,{'Content-type': 'application/json'}).then(successCallback, errorCallback);
        }
    };
});
