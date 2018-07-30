// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// init sqlite db
var fs = require('fs');
var dbFile = '.data/jeopardy.db';
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

var createTable = require('./createTable');

// if dbFile does not exist, create it
db.serialize(function() {
    if (!fs.existsSync(dbFile)) {
        createTable.createAndFillTable(db);
    }
    else {
        console.log('Database ready to go!');
    }
});

// --- GET responses ---

// Endpoint to retrieve the board page
app.get('/board', function(request, response) {
    response.sendFile(__dirname + '/views/board.html');
});

// Endpoint to get all entries in the database
app.get('/getAllQuestions', function(request, response) {
    db.all('SELECT * FROM Questions', function(err, rows) {
        response.send(JSON.stringify(rows));
    });
});

// Endpoint to get 6 unique categories for a round of Jeopardy
app.get('/get6JeopardyCategories', function(request, response) {    
    getCategories("Jeopardy!", response);
});

// Endpoint to get 6 unique categories for a round of Double Jeopardy
app.get('/get6DoubleJeopardyCategories', function(request, response) {    
    getCategories("Double Jeopardy!", response);
});

// Endpoint to get the list of questions for a given category
app.get('/getQuestionsForCategory', function(request, response) { 
    var category = request.query.category;   
    var stmt = db.prepare('SELECT * from Questions WHERE Category=?');
    stmt.all(category, function(err, rows) {
        response.send(JSON.stringify(rows));
    });
});

// listen for requests
var listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});

// Helper function to consolidate logic for Single and Double Jeopardy rounds
function getCategories(round, response) {
    // TODO take into account show number; categories can appear in different shows
    db.all('SELECT DISTINCT Category from Questions WHERE Round="' + round + '"', function(err, rows) {
        // Select 6 unique indices to choose out of the full list
        var categories = [-1, -1, -1, -1, -1, -1]; // TODO change to push
        for (var i = 0 ; i < 6 ; ) {
            var potentialCategory = Math.floor(Math.random() * rows.length);
            var chosenAlready = false;
            for (var j = 0 ; j < i ; j++) {
                if (categories[j] == potentialCategory) {
                    chosenAlready = true;
                    break;
                }
            }
            if (!chosenAlready) {
                categories[i] = potentialCategory;
                i++;
            }
        }
        var returnCategories = ["","","","","",""]; // TODO change to push
        for (var i = 0 ; i < 6 ; i++) {
            returnCategories[i] = rows[categories[i]];
        }
        response.send(JSON.stringify(returnCategories));
    });
}