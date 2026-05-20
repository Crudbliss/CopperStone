const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS ai_training_data`);
    db.run(`CREATE TABLE ai_training_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hi_score REAL,
        hc_score REAL,
        di_score REAL,
        dc_score REAL,
        target_quadrant TEXT
    )`);
    console.log("Recreated ai_training_data with HI, HC, DI, DC scores!");
});
db.close();
