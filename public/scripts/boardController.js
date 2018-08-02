var app = angular.module("JeopardyApp", []);
app.controller("boardController", function ($scope, $http) {
    $scope.jeopardyClues = [];
    $scope.doubleJeopardyClues = [];
    $scope.finalJeopardyClue = {};

    $scope.loadClues = function() {
        $http.get("https://jeopardy-online.glitch.me/get6JeopardyCategories").then(function(response) {
            var categories = response.data;
            insertClues($scope.jeopardyClues, categories);
        });

        $http.get("https://jeopardy-online.glitch.me/get6DoubleJeopardyCategories").then(function(response) {
            var categories = response.data;
            insertClues($scope.doubleJeopardyClues, categories);
        });

        $http.get("https://jeopardy-online.glitch.me/getFinalJeopardy").then(function(response) {
            $scope.finalJeopardyClue = response.data;
        });
    }

    function insertClues(roundArray, categories) {
        for (var i = 0; i < categories.length; i++) {
            var url = "https://jeopardy-online.glitch.me/getQuestionsForCategory?category=" + encodeURIComponent(categories[i].Category) + "&showNumber=" + categories[i].ShowNumber;
            $http.get(url).then(function(response) {
                var clues = response.data;
                roundArray.push(clues.sort(clueComparator));
            });
        }
    }

    function clueComparator(a, b) {
        if (a.Value > b.Value) {
            return 1;
        }
        else if (a.Value < b.Value) {
            return -1;
        }
        else {
            return 0;
        }
    }
});