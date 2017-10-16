angular.module('UserStats').factory('HoursRaw', function($http){
    return {
        getHours: function(urls,successCallback,errorCallback){

            var totalUrls = urls.length;

            $http.get(urls[0],{'Content-type': 'application/json'}).then(mergeData, showError);

            function mergeData(response){
                console.log("called merge");
                $.extend(true, allData, response.data );
                console.log(allData);
            }

            function showError(response){
                console.log("error");
            }
        }
    };
});
