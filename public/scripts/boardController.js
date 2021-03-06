var app = angular.module("Board", []);
app.controller("boardController", function ($scope, $http) {
    $scope.jeopardyClues = [];
    $scope.doubleJeopardyClues = [];
    $scope.finalJeopardyClue = {};
    $scope.jeopardyRound = true;
    $scope.doubleJeopardyRound = false;
    $scope.activeClue = null;

    var baseURL = "https://jeopardy-online.glitch.me/";
    var round = {
        "Jeopardy!" : 1,
        "Double Jeopardy!": 2,
        "Final Jeopardy!": 3
    };
    var currentRound = round["Jeopardy!"];
    var synth = window.speechSynthesis;

    $scope.loadClues = function() {
        $http.get(baseURL + "get6JeopardyCategories").then(function(response) {
            var categories = response.data;
            insertClues(categories, 1);
        });

        $http.get(baseURL + "get6DoubleJeopardyCategories").then(function(response) {
            var categories = response.data;
            insertClues(categories, 2);
        });

        $http.get(baseURL + "getFinalJeopardy").then(function(response) {
            $scope.finalJeopardyClue = response.data;
        });
    }

    $scope.showClue = function(clue) {
        $scope.jeopardyRound = false;
        $scope.doubleJeopardyRound = false;
        $scope.activeClue = clue;
        read(clue.Clue);
    }

    $scope.closeClue = function(clue) {
        clue.isActive = false;
        $scope.activeClue = null;
        if (currentRound == round["Jeopardy!"]) {
            $scope.jeopardyRound = true;
        }
        else if (currentRound == round["Double Jeopardy!"]) {
            $scope.doubleJeopardyRound = true;
        }
    }

    function insertClues(categories, round) {
        for (var i = 0; i < categories.length; i++) {
            var url = baseURL + "getQuestionsForCategory?category=" + encodeURIComponent(categories[i].rowid);
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
            clues[i-1].isActive = true;
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

    function read(text) {
        var voice = new SpeechSynthesisUtterance();
        voice.text = text;
        voice.lang = 'en-US';

        synth.speak(voice);
    }
});