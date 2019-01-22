var app = angular.module("GameMaster", []);
app.controller("gameMasterController", function ($scope, $http) {
    $scope.answer = null;
    $scope.category = null;
    $scope.clue = null;
    $scope.awaiting = false;

    var baseURL = "https://jeopardy-online.glitch.me/";
    var errorMessage = "There was an error retrieving the answer";
    
    $scope.getAnswer = function() {
        var url = baseURL + "getAnswer?category=" + $scope.category + "&clue=" + $scope.clue;
        $scope.awaiting = true;
        $http.get(url).then(function(response) {
            if (response.data.length == 0) {
                $scope.answer = errorMessage;
            }
            else {
                $scope.answer = response.data[0].Response;
            }
            $scope.awaiting = false;
        });
    }
});