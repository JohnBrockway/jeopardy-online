module.exports = {
    createAndFillTable: function(db) {
        db.run('CREATE TABLE Questions (Category TEXT, AirDate TEXT, Question TEXT, Value INTEGER, Answer TEXT, Round TEXT, ShowNumber INTEGER)');
        console.log('New table Questions created!');
        
        console.log("Reading file");
        var questions = JSON.parse(fs.readFileSync('questions/jeopardy_questions.json', 'utf8').substring(1)); // Seems to be some undefined character in first position of file; TODO
        console.log("File read");

        console.log("Starting DB build; this may take a while!");
        recursiveInsert(0, db, questions);
    }
}

function recursiveInsert(index, db, questions) {
    if (index >= questions.length) {
        console.log("Finished DB build");
        return;
    }
    else {
        // If Final Jeopardy or Tiebreaker, value is null. Otherwise, remove the $ character and store value as an int
        var value = questions[index].value == null ? -1 : questions[index].value.substring(1);
        var insertStmt = db.prepare('INSERT INTO Questions (Category, AirDate, Question, Value, Answer, Round, ShowNumber) VALUES (?,?,?,?,?,?,?)');            
        insertStmt.run([
            questions[index].category,
            questions[index].air_date,
            questions[index].question,
            value,
            questions[index].answer,
            questions[index].round,
            questions[index].show_number,
        ], function() {
            recursiveInsert(index + 1, db, questions); // Using callback to call next insert as otherwise the db will be busy often, and any arriving inserts during that state will be skipped
        });
    }
} 