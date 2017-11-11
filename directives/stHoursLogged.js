angular.module('UserStats').directive('stHoursLogged',function($timeout){
    return{
        replace: true,
        restrict: "E",
        templateUrl: "templates/directives/stHoursLogged.html",
        link: function($scope, element, attrs) {
            $scope.$on('dataloaded', function () {
                $timeout(function () {
                    console.log($scope.thisUserPool);
                    $scope.showCurrentChart();
                }, 0, false);
            })
        }
    }
});