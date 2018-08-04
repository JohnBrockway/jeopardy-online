var app = angular.module("JeopardyApp", []);
app.controller("boardController", function ($scope, $http) {
    $scope.jeopardyClues = [];
    $scope.doubleJeopardyClues = [];
    $scope.finalJeopardyClue = {};
    $scope.jeopardyRound = true;
    $scope.doubleJeopardyRound = false;
    $scope.activeClue = null;

    $scope.loadClues = function() {
        $http.get("https://jeopardy-online.glitch.me/get6JeopardyCategories").then(function(response) {
            var categories = response.data;
            insertClues(categories, 1);
        });

        $http.get("https://jeopardy-online.glitch.me/get6DoubleJeopardyCategories").then(function(response) {
            var categories = response.data;
            insertClues(categories, 2);
        });

        $http.get("https://jeopardy-online.glitch.me/getFinalJeopardy").then(function(response) {
            $scope.finalJeopardyClue = response.data;
        });
    }

    $scope.showClue = function(clue) {
        $scope.jeopardyRound = false;
        $scope.doubleJeopardyRound = false;
        $scope.activeClue = clue;
    }

    function insertClues(categories, round) {
        for (var i = 0; i < categories.length; i++) {
            var url = "https://jeopardy-online.glitch.me/getQuestionsForCategory?category=" + encodeURIComponent(categories[i].rowid);
            $http.get(url).then(function(response) {
                var clues = response.data;
                if (round == 1) {
                    $scope.jeopardyClues.push(normalizeClueValues(clues, round));
                }
                else if (round == 2) {
                    $scope.doubleJeopardyClues.push(normalizeClueValues(clues, round));
                }
            });
        }
    }

    function normalizeClueValues(clues, round) {
        clues = clues.sort(clueComparator);
        for (var i = 1 ; i <= 5 ; i++) {
            clues[i-1].Value = round * i * 200;
        }
        return clues;
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