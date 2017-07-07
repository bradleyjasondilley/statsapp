angular.module('UserStats').controller('StatsCtrl', function ($scope,$http,DataRequest){
    $scope.usrData = {"taskpoola":{},"taskpoolb":{},"taskpoolc":{},"taskpoold":{},"taskpooluk":{}};
    $scope.whichPool = 'taskpoola';



    var usrUrl = 'assets/data/userInfo.json';

    //var hoursUrl = 'kpi/hours/?startDate=20170105&endDate=20170106';
    //var hoursUrl = 'kpi/hours/?startDate=20170110&endDate=20170120';
    var hoursUrl = 'assets/data/data2.json';

    DataRequest.getData(usrUrl, 
        function(returnedData) {
            $scope.users = returnedData.data;
            prepUsers($scope.usrData,returnedData.data);
            console.log("usr");
            console.log($scope.usrData);
        },
        function(returnedData) {
            console.log("failure");
        }
    );

    DataRequest.getData(hoursUrl, 
        function(returnedData) {
            //$scope.usrStats = prepData($scope,returnedData.data);
            prepHours($scope.usrData,returnedData.data);
        },
        function(returnedData) {
            console.log("failure");
        }
    );
});

function prepUsers(usrData,userData){

    $.each(usrData, function(pool, users) {

        $.each(userData, function(name, info) {
            if(info['pool'] == pool){
                usrData[pool][name] = info;
            }
        });

    });
}

function prepHours(usrData,data){

    

    $.each(data, function(pool, users) {
        $.each(users, function(name, hours) {
            var cleanHours = [];
            var weeks = {};
            var currentWeek = 0;
            var lastWeek = currentWeek;
            var weekTotal = 0;
            var firstRun = true;
            var lastRun = false;
            var bestWeek = 0;
            var bestWeekTime = "";
            var bestWeekMin = 0;
            var worstWeek = 0;            
            var worstWeekTime = "";
            var worstWeekMin = 0;
            var totalEntries = Object.size(hours);
            var counter = 0;
            weeks['weeks'] = {};
            weeks["bestWeek"] = {};
            weeks["worstWeek"] = {};



            if(typeof usrData[pool] != "undefined"){
                
                $.each(hours, function(hDate,hTime){

                    if (counter === totalEntries - 1) {
                        lastRun = true;
                    }

                    var tmp = {};
                    tmp['time'] = minTommss(hTime);
                    tmp['day'] = moment(hDate).format("dddd");
                    var week = moment(hDate).week();
                    currentWeek = week;
                    
                    if(firstRun){
                        lastWeek = currentWeek;
                        firstRun = false;
                    }
                    
                    if(!weeks['weeks'][week]){
                        weeks['weeks'][week] = {};
                    }
                    if(!weeks['weeks'][week]["total"]){
                        weeks['weeks'][week]["total"] = 0;
                    }
                    if(!weeks['weeks'][week]["days"]){
                        weeks['weeks'][week]["days"] = {};
                    }
                    

                    if(currentWeek == lastWeek){
                        weeks['weeks'][week]["total"] += parseFloat(hTime);
                        
                        if(lastRun){
                            weeks['weeks'][week]["totalTime"] = minTommss(weeks['weeks'][week]["total"]);
                            totalMin = moment.duration(weeks['weeks'][week]["totalTime"]).asMinutes();
                            weeks['weeks'][week]["totalTime"] = minTommss(weeks['weeks'][week]["total"]);

                            if(totalMin > bestWeekMin){
                                bestWeekTime = weeks['weeks'][week]["totalTime"];
                                bestWeekMin = totalMin;
                                bestWeek = week;
                            }

                            if(totalMin < worstWeekMin){
                                worstWeekTime = weeks['weeks'][week]["totalTime"];
                                worstWeekMin = totalMin;
                                worstWeek = week;
                            }

                        }

                    }else{
                        weeks['weeks'][week]["total"] += parseFloat(hTime);
                        weeks['weeks'][week-1]["totalTime"] = minTommss(weeks['weeks'][week-1]["total"]);
                        totalMin = moment.duration(weeks['weeks'][week-1]["totalTime"]).asMinutes();
                        lastWeek = currentWeek;

                        if(totalMin > bestWeekMin){
                            bestWeekTime = weeks['weeks'][week-1]["totalTime"];
                            bestWeekMin = totalMin;
                            bestWeek = week-1;
                        }

                        if(worstWeekMin == 0){
                            worstWeekMin = totalMin;
                            worstWeekTime = weeks['weeks'][week-1]["totalTime"];
                        }

                        if(totalMin < worstWeekMin){
                            worstWeekTime = weeks['weeks'][week-1]["totalTime"];
                            worstWeekMin = totalMin;
                            worstWeek = week-1;
                        }

                        weeks["bestWeek"]['week'] = bestWeek;
                        weeks["bestWeek"]['time'] = bestWeekTime;

                        weeks["worstWeek"]['week'] = worstWeek;
                        weeks["worstWeek"]['time'] = worstWeekTime;

                    }
                    weeks['weeks'][week]["days"][hDate] = tmp;
                    counter++;
                })

                weeks["bestWeek"]['week'] = bestWeek;
                weeks["bestWeek"]['time'] = bestWeekTime;

                weeks["worstWeek"]['week'] = worstWeek;
                weeks["worstWeek"]['time'] = worstWeekTime;

                weeks['weeks'][currentWeek]["totalTime"] = minTommss(weeks['weeks'][currentWeek]["total"]);
                usrData[pool][name]['hours'] = weeks;
            }       
        });
    });
}


function getDayOfWeek(date){
    return day;
}

function minTommss(minutes){
    var sign = minutes < 0 ? "-" : "";
    var min = Math.floor(Math.abs(minutes));
    var sec = Math.floor((Math.abs(minutes) * 60) % 60);
    return sign + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// var curr = new Date; // get current date
// var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
// var last = first + 6; // last day is the first day + 6

// var firstday = new Date(curr.setDate(first)).toUTCString();
// var lastday = new Date(curr.setDate(last)).toUTCString();

// console.log("first = " + firstday);
// console.log("last = " + lastday);