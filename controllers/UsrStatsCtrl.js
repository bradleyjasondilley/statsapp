angular.module('UserStats').controller('UsrStatsCtrl', function ($scope,$http,DateRequest,DataRequest,HoursRaw){
    $scope.curretUser = getURLParameter('usr');
    $scope.thisUserPool = "";
    $scope.thisUser;

    $scope.users;
    $scope.displayData = {};
    $scope.whichPool = 'taskpoola';
    $scope.date = moment().format('YYYY MM DD');
    $scope.date = $scope.date.replace(/\s+/g,'-');
    $scope.currentWeek = moment($scope.date).week();
    $scope.currentWeek = 3;
    $scope.weeksSelect = 2;


    $scope.displayData;

    var allData = {};
    var usrUrl = 'assets/data/userInfo.json';


    //var hoursUrl = 'kpi/hours/?startDate=20170105&endDate=20170106';
    //var hoursUrl = 'kpi/hours/?startDate=20170110&endDate=20170120';
    var hoursUrl = 'assets/data/jan.json';
    
    var janURL = 'assets/data/jan.json';
    var febURL = 'assets/data/feb.json';
    var marURL = 'assets/data/mar.json';

    //var urlPrefix = "kpi/hours/";
    var urlPrefix = "assets/data/";
    var hoursUrls = ['mar.json', 'feb.json', 'jan.json'];

    // for (var i = 0; i < hoursUrls.length; i++) {
    //     $http.get(urlPrefix + hoursUrls[i],{'Content-type': 'application/json'}).then(mergeData, showError);
    // }

    // function mergeData(response){
    //     console.log("called merge");
    //     $.extend(true, allData, response.data );
    //     console.log(allData);
    // }

    // function showError(response){
    //     console.log("error");
    // }

    var dateRanges = DateRequest.getDateRange();
    //console.log("dateRanges ", dateRanges);

    DataRequest.getData(usrUrl,
        function(returnedData) {
            $scope.users = returnedData.data;
            localData = prepUsers($scope.users);
            //now get hours
            DataRequest.getData(hoursUrl,
                function(returned) {
                    newUsers = prepHours(localData,returned.data);
                    $scope.usrData = newUsers;
                    $scope.displayData = buildDisplayObject($scope.curretUser);
                },
                function(returned) {
                    console.log("get hours - failure");
                }
            );
        },
        function(returnedData) {
            console.log("get users - failure");
        }
    );

    function buildDisplayObject(usr){
        localData = $scope.usrData;
        var access = localData[$scope.thisUserPool]["users"][$scope.curretUser]["access"];
        var tmpDisplay = {};


        if(access == "all"){
            return localData;
        }else{
            $.each(localData, function(pool, users) {

                if(pool == $scope.thisUserPool){
                    if(access == "team"){
                      if(!tmpDisplay[pool]){
                          tmpDisplay[pool] = {};
                          tmpDisplay[pool]["users"] = {};
                          tmpDisplay[pool]["users"] = users["users"];
                          return false;
                      }
                    }else{
                        $.each(users["users"], function(name, data) {
                            if(name == usr){
                                if(!tmpDisplay[pool]){
                                    tmpDisplay[pool] = {};
                                    tmpDisplay[pool]["users"] = {};
                                    tmpDisplay[pool]["users"][usr] = data;
                                    return false;
                                }
                            }
                        });
                        return false;
                    }
                }
            });
        }
        return tmpDisplay;
    }

    function prepUsers(requestData){
        localUsrData = {"taskpoola":{},"taskpoolb":{},"taskpoolc":{},"taskpoold":{},"taskpooluk":{},"manager":{}};
        localRequestData = requestData;

        $.each(localUsrData, function(pool, users) {

            $.each(localRequestData, function(name, info) {
                if(info['pool'] == pool){
                    if(!localUsrData[pool]["users"]){
                        localUsrData[pool]["users"] = {};
                    }
                    localUsrData[pool]["users"][name] = info;
                    if(name == $scope.curretUser){
                        $scope.thisUserPool = pool;
                    }
                }
            });

        });
        var addedUsr = {};
        addedUsr["name"] = "Matthew Brovelli";
        if(!localUsrData["manager"]){
            localUsrData["manager"] = {};
            localUsrData["manager"]["users"]["matthewb"] = addedUsr;
        }
        return localUsrData;
    }

    // Function to add screenshot
    $scope.takeScreenShot = function() {
        console.log('taking a screenshot!');
        //hide selector of pools
        $('#actions-wrapper').hide()
        html2canvas(document.body, {
            onrendered: function(canvas) {
                console.log('screenshot done!');
                document.body.appendChild(canvas);
                $('#actions-wrapper').show()
            }
        });
    }

});

function prepHours(usrData,data){
    localUsrData = usrData;
    localData = data;

    $.each(localData, function(pool, users) {
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
            var weekCounter = 1;

            weeks = {};
            weekTotals = {};
            weekTotals["bestWeek"] = {};
            weekTotals["average"] = 0;
            weekTotals["averageDisplay"] = 0;
            weekTotals["worstWeek"] = {};
            weekTotals["weekTotals"] = {};
            weekTotals["weekTotalsChart"] = {
                "week": [],
                "time":[],
                "hours":[]
            };
            weekTotals["alltime"] = {
                "hours" : 0,
                "mins" : 0,
                "time" : 0
            };

            //Skip unknown users and pools

            if(typeof localUsrData[pool] == "undefined" || typeof localUsrData[pool]["users"][name] == "undefined"){
                return true;
            }



            if(typeof localUsrData[pool] != "undefined"){
                var chartDay = [];
                var chartTime = [];
                var chartHours = [];

                $.each(hours, function(hDate,hTime){

                    if (counter === totalEntries - 1) {
                        lastRun = true;
                    }

                    var tmp = {};
                    tmp['timeLogged'] = minTommss(hTime);
                    tmp['time'] = hTime;
                    tmp['day'] = moment(hDate).format("ddd");


                    var week = moment(hDate).week();
                    
                    localUsrData[pool]["users"][name]["currentWeek"] = week;
                    var year = moment(hDate).year();
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

                    if(!weeks[week]["chartData"]){
                        weeks[week]["chartData"] = {};
                    }


                    if(currentWeek == lastWeek){
                        weeks[week]["totalHoursValue"] += parseFloat(hTime);

                        if(lastRun){
                            weeks[week]["totalHoursTime"] = minTommss(weeks[week]["totalHoursValue"]);
                            totalHours = moment.duration(weeks[week]["totalHoursTime"]).asHours();
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

                            if(!weekTotals["weekTotals"][week]){
                                weekTotals["weekTotals"][week] = {};
                            }

                            weekTotals["weekTotals"][week]["min"] =  totalMin;
                            weekTotals["weekTotals"][week]["hours"] =  totalHours;
                            weekTotals["weekTotals"][week]["time"] =  weeks[week]["totalHoursTime"];
                            weekTotals["weekTotalsChart"]["week"].push(week);
                            weekTotals["weekTotalsChart"]["time"].push(weeks[week]["totalHoursTime"]);
                            weekTotals["weekTotalsChart"]["hours"].push(totalHours);

                            currentMins = weekTotals["alltime"]["mins"];
                            newMins = currentMins + totalMin;
                            weekTotals["alltime"]["mins"] = newMins;
                            weekTotals["alltime"]["hours"] = moment.duration(newMins, 'minutes').asHours();
                            weekTotals["alltime"]["time"] = minTommss(weekTotals["alltime"]["hours"]);

                            weekTotals["average"] = weekTotals["alltime"]["hours"] / weekCounter;
                            weekTotals["averageDisplay"] = minTommss(weekTotals["average"]);
                        }

                    }else{
                        weeks[week]["totalHoursValue"] += parseFloat(hTime);
                        weeks[week-1]["totalHoursTime"] = minTommss(weeks[week-1]["totalHoursValue"]);
                        totalHours = moment.duration(weeks[week-1]["totalHoursTime"]).asHours();
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

                        split = weeks[week-1]["totalHoursTime"].split(":");
                        weeks[week-1]["totalHoursTimeHours"] = split[0];
                        weeks[week-1]["totalHoursTimeMins"] = split[1];

                        weekTotals["bestWeek"]['hoursWeek'] = bestWeek;
                        weekTotals["bestWeek"]['hoursTime'] = bestWeekTime;

                        weekTotals["worstWeek"]['hoursWeek'] = worstWeek;
                        weekTotals["worstWeek"]['hoursTime'] = worstWeekTime;

                        if(!weekTotals["weekTotals"][week-1]){
                            weekTotals["weekTotals"][week-1] = {};
                        }



                        weekTotals["weekTotals"][week-1]["min"] =  totalMin;
                        weekTotals["weekTotals"][week-1]["hours"] =  totalHours;
                        weekTotals["weekTotals"][week-1]["time"] =  weeks[week-1]["totalHoursTime"];
                        weekTotals["weekTotalsChart"]["week"].push(week-1);
                        weekTotals["weekTotalsChart"]["time"].push(weeks[week-1]["totalHoursTime"]);
                        weekTotals["weekTotalsChart"]["hours"].push(totalHours);


                        currentMins = weekTotals["alltime"]["mins"];
                        newMins = currentMins + totalMin;
                        weekTotals["alltime"]["mins"] = newMins;
                        weekTotals["alltime"]["hours"] = moment.duration(newMins, 'minutes').asHours();
                        weekTotals["alltime"]["time"] = minTommss(weekTotals["alltime"]["hours"]);

                        weekTotals["average"] = weekTotals["alltime"]["hours"] / weekCounter;
                        weekTotals["averageDisplay"] = minTommss(weekTotals["average"]);

                        chartDay = [];
                        chartTime = [];
                        chartHours = [];
                        weekCounter++;
                    }

                    chartDay.push(tmp['day']);
                    chartTime.push(tmp['timeLogged']);
                    chartHours.push(tmp['time']);


                    weeks[week]["days"][hDate] = tmp;
                    var chart = {};

                    chart["labels"] = chartDay;
                    chart["data"] = chartHours;
                    chart["colors"] = genColours(chartHours);

                    weeks[week]["chartData"] = chart;
                    counter++;
                })

                weekTotals["bestWeek"]['hoursWeek'] = bestWeek;
                weekTotals["bestWeek"]['hoursTime'] = bestWeekTime;

                weekTotals["worstWeek"]['hoursWeek'] = worstWeek;
                weekTotals["worstWeek"]['hoursTime'] = worstWeekTime;

                weeks[currentWeek]["totalHoursTime"] = minTommss(weeks[currentWeek]["totalHoursValue"]);
                split = weeks[currentWeek]["totalHoursTime"].split(":");
                weeks[currentWeek]["totalHoursTimeHours"] = split[0];
                weeks[currentWeek]["totalHoursTimeMins"] = split[1];
                localUsrData[pool]["users"][name]['weeks'] = weeks;
                localUsrData[pool]["users"][name]['totals'] = weekTotals;
            }
        });
    });
    return localUsrData;
}

function genColours(data){

    var range = ["#FF1202","#FF9900","#E4FF00","#75FE00","#00FE00"]
    var colours = [];
    for (var i = 0; i < data.length; i++) {
        if(data[i] < 5){
            colours.push(range[0]);
        }else if(data[i] < 5.5){
            colours.push(range[1]);
        }else if(data[i] < 6){
            colours.push(range[2]);
        }else if(data[i] < 7){
            colours.push(range[3]);
        }else if(data[i] >= 7){
            colours.push(range[4]);
        }
    }

    return colours;
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

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}
