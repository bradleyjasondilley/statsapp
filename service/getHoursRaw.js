angular.module('UserStats').factory('HoursRaw', function($http,$q){
    return {
        getHours: function(urls,successCallback,errorCallback){
            var deferred = $q.defer();
            
            var counter = 0;
            var totalUrls = urls.length;
            var allData = {};

            
            getData(0);

            function getData(item){
                $http.get("assets/data/" + urls[item],{'Content-type': 'application/json'}).then(mergeData, showError);
            }

            function mergeData(response){
                $.extend(true, allData, response.data );
                counter++;
                if(counter < totalUrls){
                    getData(counter);
                }else{
                    successCallback(allData);
                }
            }

            function showError(response){
                console.log("error");
            }
        }
    };
});
