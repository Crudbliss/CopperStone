const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database opening error: ', err);
        process.exit(1);
    }
});

db.serialize(() => {
    console.log("Starting migration...");

    // 1. Add learning_mode to teachers
    db.run(`ALTER TABLE teachers ADD COLUMN learning_mode TEXT`, (err) => {
        if (err) console.log("Note: learning_mode might already exist on teachers.");
        else console.log("Added learning_mode to teachers.");
    });

    // 2. Drop the old classes table
    db.run(`DROP TABLE IF EXISTS classes`, (err) => {
        if (err) console.error("Error dropping classes:", err);
        else console.log("Dropped old classes table.");
    });

    // 3. Recreate classes table
    db.run(`CREATE TABLE classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prog_name TEXT NOT NULL,
        year_level TEXT,
        section TEXT,
        school_year TEXT,
        learning_mode TEXT,
        teacher_id INTEGER,
        is_archived INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
    )`, (err) => {
        if (err) console.error("Error creating classes:", err);
        else console.log("Recreated classes table.");
    });

    // 4. Reset students
    db.run(`UPDATE students SET x_coord = 0, y_coord = 0, learning_mode = NULL`, (err) => {
        if (err) console.error("Error resetting students:", err);
        else console.log("Reset students' assessment data.");
    });

    // 5. Delete student responses
    db.run(`DELETE FROM student_responses`, (err) => {
        if (err) console.error("Error clearing responses:", err);
        else console.log("Cleared student_responses.");
    });

    // 6. Delete history just in case
    db.run(`DELETE FROM assessment_history`, (err) => {
        if (err) console.error("Error clearing history:", err);
        else console.log("Cleared assessment_history.");
    });
    
    // 7. Delete sessions just in case
    db.run(`DELETE FROM assessment_sessions`, (err) => {
        if (err) console.error("Error clearing sessions:", err);
        else console.log("Cleared assessment_sessions.");
    });

    console.log("Migration finished.");
});
