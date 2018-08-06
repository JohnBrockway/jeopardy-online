var app = angular.module("GameMaster", []);
app.controller("gameMasterController", function ($scope, $http) {
    $scope.answer = null;
    $scope.category = null;
    $scope.clue = null;
    
    $scope.getAnswer = function() {
        console.log($scope.category + " " + $scope.clue);
        var url = "https://jeopardy-online.glitch.me/getAnswer?category=" + $scope.category + "&clue=" + $scope.clue;
        $http.get(url).then(function(response) {
            if (response.data.length == 0) {
                console.log("error");
            }
            else {
                $scope.answer = response.data[0].Response;
            }
        });
    }
});