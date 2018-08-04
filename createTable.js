// init sqlite db
var fs = require('fs');
var dbFile = '.data/jeopardy.db';
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

if (process.argv[2] == "1") {
    createAndFillTable();
}
else if (process.argv[2] == "2") {
    fillCategoriesTable();
}
else if (process.argv[2] == "3") {
    insertQuestionIDs();
}
else {
    console.log("Please enter a number corresponding to your current step in the process; 1, 2, or 3");
    console.log("For example, 'node createTable.js 1'");
    console.log('1: Create tables, fill the Questions table with the JSON data (excluding CategoryID and ClueID)');
    console.log('2: Use the distinct "Category"s in the Question table to fill the Categories table, and then also fill out the CategoryID column in the Question table');
    console.log('3: Using the knowledge of which categories are distinct, fill the ClueID column in the Questions table');
}

function createAndFillTable() {
    db.run('CREATE TABLE Questions (Category TEXT, CategoryID INTEGER, AirDate TEXT, Clue TEXT, ClueID INTEGER, Value INTEGER, Response TEXT, Round TEXT, ShowNumber INTEGER)');
    db.run('CREATE TABLE Categories (Category TEXT, Round TEXT, ShowNumber INTEGER, NumberQuestions INTEGER)');
    console.log('New tables Questions and Categories created!');

    console.log("Reading file");
    var questions = JSON.parse(fs.readFileSync('questions/jeopardy_questions.json', 'utf8').substring(1)); // Seems to be some undefined character in first position of file; TODO
    console.log("File read");

    console.log("Starting Question DB build; this may take a while!");
    insertQuestionRows(questions);
}

function insertQuestionRows(questions) {
    db.serialize(function () {
        for (var i = 0 ; i < questions.length ; i++) {
            // If Final Jeopardy or Tiebreaker, value is null. Otherwise, remove the $ character and store value as an int
            var value = questions[i].value == null ? -1 : parseInt(questions[i].value.substring(1));
            var insertStmt = db.prepare('INSERT INTO Questions (Category, AirDate, Clue, Value, Response, Round, ShowNumber) VALUES (?,?,?,?,?,?,?)');
            insertStmt.run([
                questions[i].category,
                questions[i].air_date,
                questions[i].question,
                value,
                questions[i].answer,
                questions[i].round,
                questions[i].show_number,
            ]);
        }
    });
}

function fillCategoriesTable() {
    db.run('INSERT INTO Categories (Category, Round, ShowNumber, NumberQuestions) ' +
            'SELECT Category, Round, ShowNumber, COUNT(*) from Questions GROUP BY Category, Round, ShowNumber', function () {
        getCategoryIDs();
    });
}

function getCategoryIDs() {
    db.all('SELECT RowID, * FROM Categories', function (err, rows) {
        insertCategoryIDs(rows);
    });
}

function insertCategoryIDs(categories) {
    db.serialize(function () {
        for (var i = 0 ; i < categories.length ; i++) {
            var stmt = db.prepare('UPDATE Questions SET CategoryID=? WHERE Category=? AND Round=? AND ShowNumber=?');
            stmt.run([
                categories[i].rowid,
                categories[i].Category,
                categories[i].Round,
                categories[i].ShowNumber
            ]);
        }
    });
}

function insertQuestionIDs() {
    db.all('SELECT RowID FROM Categories', function (err, rows) {
        getQuestionsAndInsertIDs(rows);
    });
}

function getQuestionsAndInsertIDs(categories) {
    db.serialize(function () {
        for (var i = 0 ; i < categories.length ; i++) {
            var stmt = db.prepare('SELECT RowID,* FROM Questions WHERE CategoryID=?');
            stmt.all(categories[i].rowid, function (err, rows) {
                insertQuestionIDsForCategory(rows);
            });
        }
    });
}

function insertQuestionIDsForCategory(questions) {
    questions = questions.sort(valueComparator);
    db.serialize(function () {
        for (var i = 0 ; i < questions.length ; i++) {
            var stmt = db.prepare('UPDATE Questions SET ClueID=? WHERE RowID=?');
            stmt.run([i + 1, questions[i].rowid]);
        }
    });
}

function valueComparator(a, b) {
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
