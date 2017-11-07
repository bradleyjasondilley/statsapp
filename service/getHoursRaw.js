angular.module('UserStats').factory('HoursRaw', function($http,$q){
    return {
        getHours: function(urls,displayUsers,successCallback,errorCallback){
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
                    var individuals = stripFromPool(allData);
                    var displayData = buildDisplay(individuals);
                    successCallback(displayData);
                }
            }

            function showError(response){
                console.log("error");
            }

            function buildDisplay(userData){
                var tmp = {};

                $.each(displayUsers, function(pool, poolUsers) {
                    $.each(poolUsers.users, function(name, data) {
                        if(!tmp[pool]){
                            tmp[pool] = {};
                        }
                        tmp[pool][name] = userData[name];
                    })
                })
                return tmp;
            }

            function stripFromPool(data){
                var tmp = {};
                $.each(data, function(pool, poolUsers) {
                    $.each(poolUsers, function(name, data) {
                        if(tmp[name]){
                            var currentData = tmp[name];
                            var newData = data;
                            var original = Object.assign(currentData,newData);
                            var merged = {};
                            
                            var keys = Object.keys(original);
                            keys.sort()
                            for (i = 0; i < keys.length; i++) {
                                merged[keys[i]] = original[keys[i]];
                            }
                            tmp[name] = merged;
    
                        }else{
                            tmp[name] = data;
                        }
                    })
                })
                return tmp;
            }
        }
    };
});
