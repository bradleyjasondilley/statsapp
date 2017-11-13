angular.module('UserStats').controller('UsrStatsCtrl', function ($scope,$http,$timeout,DateRequest,DataRequest,HoursRaw,UserList){
    $scope.curretUser = getURLParameter('showUsr');
    $scope.thisUserPool = "";
    $scope.thisUser;
    $scope.poolDisplayName = {
        "taskpoola" : "Pool A",
        "taskpoolc" : "Pool C",
        "taskpoold" : "Pool D",
        "taskpooluk" : "Pool UK",
        "manager" : "Managers"
    }
    $scope.users;
    $scope.displayData = {};
    $scope.whichPool = 'taskpoola';
    $scope.date = moment().format('YYYY MM DD');
    $scope.date = $scope.date.replace(/\s+/g,'-');
    $scope.currentWeek = moment($scope.date).week();
    weekArray = moment().startOf('week');
    $scope.overviewWeeks = [];
    $scope.colourVal = 0;
    
    for (var index = $scope.currentWeek; index > 0; index--) {
        $scope.overviewWeeks.push(index);
    }
    
    //$scope.currentWeek = 44;
    //$scope.weeksSelect = 40;

    var start = moment().day("Sunday").week($scope.currentWeek).format('DD');
    var end = moment().day("Saturday").week($scope.currentWeek).format('DD');


    $scope.displayData;
    var usrUrl = 'assets/data/userInfo.json';

    //var urlPrefix = "kpi/hours/";
    var urlPrefix = "assets/data/";
    var hoursUrls = ['jan.json', 'feb.json', 'mar.json', 'apr.json', 'may.json', 'jun.json', 'jul.json', 'aug.json', 'sep.json', 'oct.json','nov.json'];
    //var hoursUrls = ['sep.json', 'oct.json'];
    //var hoursUrls = ['jan.json', 'feb.json'];

    // Live urls to use
    var dateRanges = DateRequest.getDateRange();

    DataRequest.getData(usrUrl,
        function(returnedData) {
            $scope.users = returnedData.data;
            UserList.getUsers($scope.curretUser,$scope.users,getUsersSuccess,getUsersFailure);
        },
        function(returnedData) {
            console.log("get users - failure");
        }
    );

    function getUsersSuccess(returned){
        localData = prepUsers(returned);
        HoursRaw.getHours(hoursUrls,localData,getHoursSuccess,getHoursFailure);
    }

    function getUsersFailure(returned){
        console.log("called getUsersFailure");
    }

    function getHoursSuccess(returned){
        newUsers = prepHours(localData,$scope.users,returned);
        $scope.usrData = newUsers;
        $scope.displayData = buildDisplayObject($scope.curretUser);
        console.log($scope.displayData);
        $scope.$broadcast('dataloaded');
    }
    function getHoursFailure(returned){
        console.log("called getHoursFailure");
    }

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
        localUsrData = {"taskpoola":{},"taskpoolc":{},"taskpoold":{},"taskpooluk":{},"manager":{}};
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
            if(!localUsrData[pool]["users"]){
                delete localUsrData[pool];
            }
        });

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

    $scope.changeWeek = function(member){
        var week = $('#' + member + "_weeks").val();
        $('#' + member + "_" + week).show();
    }

    $scope.setVisible = function(week){
        if(week == $scope.currentWeek){
            return "show";
        }else{
            return "hide";
        }
    }

    $scope.showCurrentChart = function(){
        $.each($scope.displayData, function(pool, users) {
            $.each(users.users, function(name,data){
                $('#' + name + '_' + $scope.currentWeek).show();
            })
        });
    }

    $scope.broadcastRender = function(){
        $scope.$broadcast('dataloaded');
    }

    $scope.checkLength = function(pool){
        return Object.keys($scope.displayData[pool].users).length;
    }

    //(curretUser == 'bradleyd' || curretUser == 'matthewb') && thisUserPool == 'manager'

    $scope.showSummary = function(pool){
        if(($scope.curretUser == 'bradleyd' || $scope.curretUser == 'matthewb')){
            if($scope.thisUserPool == "manager"){
                return true;
            }else if(pool == $scope.thisUserPool){
                return true;
            }
            
        }
        if($scope.users[$scope.curretUser].access == "team" && pool == $scope.users[$scope.curretUser].pool){
            return true;
        }

    }

    $scope.checkTotal = function(total){
        if(total){
            var tmp = parseInt(total.replace(":",""));
            if(tmp < 2500){
                return "below";
            }else if(tmp > 3000){
                return "above";
            }
        }
    }


    $scope.getColour = function(){
        $scope.colourVal ++;
        if($scope.colourVal == 13){
            $scope.colourVal = 1;
        }
        var colourClass = "colour" + $scope.colourVal;
        console.log(colourClass);
        return colourClass;
    }
});



function prepHours(usrData,usrs,data){
    localUsrData = usrData;
    localData = data;

    $.each(localData, function(pool, users) {
        if(typeof usrData[pool] == "undefined" || typeof usrData[pool].users == "undefined" || pool == "manager"){
            return true;
        }
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

            if(typeof usrs[name] == "undefined"){
                return true;
            }

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

            if(typeof usrs[name] == "undefined"){
                return true;
            }

            //Skip unknown users and pools
            if(typeof localUsrData[pool] == "undefined" || typeof localUsrData[pool]["users"][name] == "undefined" ){
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

                    var weekStart = moment().day("Sunday").week(week).format('MMM DD');
                    var weekEnd = moment().day("Saturday").week(week).format('MMM DD');

                    if(!weeks[week]["dateRange"]){
                        weeks[week]["dateRange"] = weekStart + " - " + weekEnd;
                    }

                    if(!weeks[week]["weekNumber"]){
                        weeks[week]["weekNumber"] = week;
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
                        weeks[lastWeek]["totalHoursTime"] = minTommss(weeks[lastWeek]["totalHoursValue"]);
                        totalHours = moment.duration(weeks[lastWeek]["totalHoursTime"]).asHours();
                        totalMin = moment.duration(weeks[lastWeek]["totalHoursTime"]).asMinutes();
                        


                        if(totalMin > bestWeekMin){
                            bestWeekTime = weeks[lastWeek]["totalHoursTime"];
                            bestWeekMin = totalMin;
                            bestWeek = lastWeek;
                        }

                        if(worstWeekMin == 0){
                            worstWeekMin = totalMin;
                            worstWeekTime = weeks[lastWeek]["totalHoursTime"];
                        }

                        if(totalMin < worstWeekMin){
                            worstWeekTime = weeks[lastWeek]["totalHoursTime"];
                            worstWeekMin = totalMin;
                            worstWeek = lastWeek;
                        }

                        split = weeks[lastWeek]["totalHoursTime"].split(":");
                        weeks[lastWeek]["totalHoursTimeHours"] = split[0];
                        weeks[lastWeek]["totalHoursTimeMins"] = split[1];

                        weekTotals["bestWeek"]['hoursWeek'] = bestWeek;
                        weekTotals["bestWeek"]['hoursTime'] = bestWeekTime;

                        weekTotals["worstWeek"]['hoursWeek'] = worstWeek;
                        weekTotals["worstWeek"]['hoursTime'] = worstWeekTime;

                        if(!weekTotals["weekTotals"][lastWeek]){
                            weekTotals["weekTotals"][lastWeek] = {};
                        }



                        weekTotals["weekTotals"][lastWeek]["min"] =  totalMin;
                        weekTotals["weekTotals"][lastWeek]["hours"] =  totalHours;
                        weekTotals["weekTotals"][lastWeek]["time"] =  weeks[lastWeek]["totalHoursTime"];
                        weekTotals["weekTotalsChart"]["week"].push(lastWeek);
                        weekTotals["weekTotalsChart"]["time"].push(weeks[lastWeek]["totalHoursTime"]);
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
                        lastWeek = currentWeek;
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
