var app = angular.module("GameMaster", []);
app.controller("gameMasterController", function ($scope, $http) {
    $scope.answer = null;
    $scope.category = null;
    $scope.clue = null;

    var baseURL = "https://jeopardy-online.glitch.me/";
    
    $scope.getAnswer = function() {
        var url = baseURL + "getAnswer?category=" + $scope.category + "&clue=" + $scope.clue;
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