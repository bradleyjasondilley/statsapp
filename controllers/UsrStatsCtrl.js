angular.module('UserStats').controller('UsrStatsCtrl', function ($scope,$http,DataRequest){
    $scope.usrData = {"taskpoola":{},"taskpoolb":{},"taskpoolc":{},"taskpoold":{},"taskpooluk":{}};
    $scope.whichPool = 'taskpoola';
    $scope.date = moment().format('YYYY MM DD');
    $scope.date = $scope.date.replace(/\s+/g,'-');
    $scope.currentWeek = moment($scope.date).week();
    $scope.currentWeek = 3;
    $scope.weeksSelect = 2;

    $scope.myJson = {
      type : "bar",
        "scale-x":{
            values:["Mon","Tue","Wed","Thur","Fri"]
        },
        series : [
        {
          values : [8,2.25,4.75,4,5],
          backgroundColor : "#31a66c"
        }
      ]
    };

    $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    $scope.series = ['Series A'];
    $scope.colors = ["#cccccc","#FF00FF","#0000ff"]
    $scope.data = [ 65, 59, 80, 81, 56, 55, 40 ];

    var usrUrl = 'assets/data/userInfo.json';

    //var hoursUrl = 'kpi/hours/?startDate=20170105&endDate=20170106';
    //var hoursUrl = 'kpi/hours/?startDate=20170110&endDate=20170120';
    var hoursUrl = 'assets/data/data.json';

    DataRequest.getData(usrUrl, 
        function(returnedData) {
            console.log('fresh state',returnedData.data);
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
            //prepChartData($scope.usrData);
        },
        function(returnedData) {
            console.log("failure");
        }
    );

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

function prepChartData(data){
    $.each(data, function(pool, users) {
        $.each(users, function(name, usrData) {
            $.each(usrData, function(key, value) {
                if(key == "weeks"){
                    console.log("key " + key + " value " + value);
                }
            });
        });
    });
}

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
                    usrData[pool][name]["currentWeek"] = week;
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
                        console.log("reset");
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

                        split = weeks[week-1]["totalHoursTime"].split(":");
                        weeks[week-1]["totalHoursTimeHours"] = split[0];
                        weeks[week-1]["totalHoursTimeMins"] = split[1];

                        weekTotals["bestWeek"]['hoursWeek'] = bestWeek;
                        weekTotals["bestWeek"]['hoursTime'] = bestWeekTime;

                        weekTotals["worstWeek"]['hoursWeek'] = worstWeek;
                        weekTotals["worstWeek"]['hoursTime'] = worstWeekTime;
                        chartDay = [];
                        chartTime = [];
                        chartHours = [];
                    }

                    chartDay.push(tmp['day']);
                    chartTime.push(tmp['timeLogged']);
                    chartHours.push(tmp['time']);


                    weeks[week]["days"][hDate] = tmp;
                    //var chart = {type : "bar", "scale-x" : {}, "scale-y":{"values":"0:12:1"}, "series":[{}] };
                    var chart = {};

                    chart["labels"] = chartDay;
                    chart["data"] = chartHours;
                    chart["colors"] = genColours(chartHours);;

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
                usrData[pool][name]['weeks'] = weeks;
                usrData[pool][name]['totals'] = weekTotals;
            }
        });
    });
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
        }else if(data[i] < 6.5){
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


// var curr = new Date; // get current date
// var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
// var last = first + 6; // last day is the first day + 6

// var firstday = new Date(curr.setDate(first)).toUTCString();
// var lastday = new Date(curr.setDate(last)).toUTCString();

// console.log("first = " + firstday);
// console.log("last = " + lastday);