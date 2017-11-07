angular.module('UserStats').factory('DataRequest', function($http){
    //var url = 'kpi/hours/?startDate=20170105&endDate=20170106';
    //var url = 'kpi/hours/?startDate=20170110&endDate=20170120';
    var url = 'assets/data/data.json';
    return {
        getData: function(url,successCallback,errorCallback){
            $http.get(url,{'Content-type': 'application/json'}).then(successCallback, errorCallback);
        }
    };
});
