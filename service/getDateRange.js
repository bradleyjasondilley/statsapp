angular.module('UserStats').factory('DateRequest', function(){
    return {
        getDateRange: function(){
            var today = moment().format('YYYY-MM-DD');
            var dateStart = moment("2017-01-01");
            var dateEnd = moment(today);
            var timeValues = [];

            while(dateEnd > dateStart){
                var monthRange = "?startDate=" + dateEnd.format('YYYYMM') + "01";
                monthRange += "&endDate=" + dateEnd.format('YYYYMM') + dateEnd.daysInMonth();
                timeValues.push(monthRange);
                dateEnd.subtract(1,'month');
            }

            return timeValues;
        }
    };
});