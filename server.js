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

// if dbFile does not exist, create it
db.serialize(function(){
    if (!fs.existsSync(dbFile)) {
        createAndFillDB();
    }
    else {
        console.log('Database ready to go!');
    }
});

app.get('/board', function(request, response) {
    response.sendFile(__dirname + '/views/board.html');
});

app.get('/get6JeopardyCategories', function(request, response) {    
    getCategories("Jeopardy!", response);
});

app.get('/get6DoubleJeopardyCategories', function(request, response) {    
    getCategories("Double Jeopardy!", response);
});

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

function createAndFillDB() {
    db.run('CREATE TABLE Questions (Category TEXT, AirDate TEXT, Question TEXT, Value INTEGER, Answer TEXT, Round TEXT, ShowNumber INTEGER)');
    console.log('New table Questions created!');
        
    console.log("Reading file");
    var questions = JSON.parse(fs.readFileSync('questions/jeopardy_questions.json', 'utf8').substring(1));
    console.log("File read");

    console.log("Starting DB build");
    // insert questions from file
    var stmt = db.prepare('INSERT INTO Questions (Category, AirDate, Question, Value, Answer, Round, ShowNumber) VALUES (?,?,?,?,?,?,?)');
    for (var i = 0 ; i < questions.length ; i++) {
        var value;
        if (questions[i].value == null) {
            value = -1;
        }
        else {
            value = questions[i].value.substring(1);
        }
        db.serialize(function() {
            stmt.run([
                questions[i].category,
                questions[i].air_date,
                questions[i].question,
                value,
                questions[i].answer,
                questions[i].round,
                questions[i].show_number,
            ]);            
        });
    }
    console.log("Finished DB build");
}

function getCategories(round, response) {
    db.all('SELECT DISTINCT Category from Questions WHERE Round="' + round + '"', function(err, rows) {
        // Select 6 unique indices to choose out of the full list
        var categories = [-1, -1, -1, -1, -1, -1];
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
        var returnCategories = ["","","","","",""];
        for (var i = 0 ; i < 6 ; i++) {
            returnCategories[i] = rows[categories[i]];
        }
        response.send(JSON.stringify(returnCategories));
    });
}