angular.module('UserStats').controller('UsrStatsCtrl', function ($scope,$http,DataRequest){
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
            //console.log("usr");
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
            weeks = {};
            weekTotals = {};
            weekTotals["bestWeek"] = {};
            weekTotals["worstWeek"] = {};



            if(typeof usrData[pool] != "undefined"){
                
                $.each(hours, function(hDate,hTime){

                    if (counter === totalEntries - 1) {
                        lastRun = true;
                    }

                    var tmp = {};
                    tmp['timeLogged'] = minTommss(hTime);
                    tmp['day'] = moment(hDate).format("dddd");
                    var week = moment(hDate).week();
                    currentWeek = week;
                    
                    if(firstRun){
                        lastWeek = currentWeek;
                        firstRun = false;
                    }
                    
                    if(!weeks[week]){
                        weeks[week] = {};
                    }
                    if(!weeks[week]["totalHoursValue"]){
                        weeks[week]["totalHoursValue"] = 0;
                    }
                    if(!weeks[week]["days"]){
                        weeks[week]["days"] = {};
                    }
                    

                    if(currentWeek == lastWeek){
                        weeks[week]["totalHoursValue"] += parseFloat(hTime);
                        
                        if(lastRun){
                            weeks[week]["totalHoursTime"] = minTommss(weeks[week]["totalHoursValue"]);
                            totalMin = moment.duration(weeks[week]["totalHoursTime"]).asMinutes();
                            weeks[week]["totalHoursTime"] = minTommss(weeks[week]["totalHoursValue"]);

                            if(totalMin > bestWeekMin){
                                bestWeekTime = weeks[week]["totalHoursTime"];
                                bestWeekMin = totalMin;
                                bestWeek = week;
                            }

                            if(totalMin < worstWeekMin){
                                worstWeekTime = weeks[week]["totalHoursTime"];
                                worstWeekMin = totalMin;
                                worstWeek = week;
                            }

                        }

                    }else{
                        weeks[week]["totalHoursValue"] += parseFloat(hTime);
                        weeks[week-1]["totalHoursTime"] = minTommss(weeks[week-1]["totalHoursValue"]);
                        totalMin = moment.duration(weeks[week-1]["totalHoursTime"]).asMinutes();
                        lastWeek = currentWeek;

                        if(totalMin > bestWeekMin){
                            bestWeekTime = weeks[week-1]["totalHoursTime"];
                            bestWeekMin = totalMin;
                            bestWeek = week-1;
                        }

                        if(worstWeekMin == 0){
                            worstWeekMin = totalMin;
                            worstWeekTime = weeks[week-1]["totalHoursTime"];
                        }

                        if(totalMin < worstWeekMin){
                            worstWeekTime = weeks[week-1]["totalHoursTime"];
                            worstWeekMin = totalMin;
                            worstWeek = week-1;
                        }

                        weekTotals["bestWeek"]['hoursWeek'] = bestWeek;
                        weekTotals["bestWeek"]['hoursTime'] = bestWeekTime;

                        weekTotals["worstWeek"]['hoursWeek'] = worstWeek;
                        weekTotals["worstWeek"]['hoursTime'] = worstWeekTime;

                    }
                    weeks[week]["days"][hDate] = tmp;
                    counter++;
                })

                weekTotals["bestWeek"]['hoursWeek'] = bestWeek;
                weekTotals["bestWeek"]['hoursTime'] = bestWeekTime;

                weekTotals["worstWeek"]['hoursWeek'] = worstWeek;
                weekTotals["worstWeek"]['hoursTime'] = worstWeekTime;

                weeks[currentWeek]["totalHoursTime"] = minTommss(weeks[currentWeek]["totalHoursValue"]);
                // /split = weeks[currentWeek]["totalHoursTime"].split(":");
                //console.log(split[0]);
                //weeks[currentWeek]["totalHoursTimeHours"] = split[0];
                //weeks[currentWeek]["totalHoursTimeHours"] = split[1];
                usrData[pool][name]['weeks'] = weeks;
                usrData[pool][name]['totals'] = weekTotals;
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