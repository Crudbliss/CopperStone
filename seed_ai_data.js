const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const csvPath = path.join(__dirname, 'dummy_dataset.csv');
const csvData = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvData.trim().split('\n');
const headers = lines[0].split(',');

db.serialize(() => {
    // Create table
    db.run(`CREATE TABLE IF NOT EXISTS ai_training_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_score REAL,
        group_score REAL,
        research_score REAL,
        seatwork_score REAL,
        target_quadrant TEXT
    )`);

    // Clear existing data to avoid duplicates if run multiple times
    db.run(`DELETE FROM ai_training_data`);

    // Insert data
    const stmt = db.prepare(`INSERT INTO ai_training_data (quiz_score, group_score, research_score, seatwork_score, target_quadrant) VALUES (?, ?, ?, ?, ?)`);
    
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length === 5) {
            stmt.run([parseFloat(row[0]), parseFloat(row[1]), parseFloat(row[2]), parseFloat(row[3]), row[4].trim()]);
        }
    }
    
    stmt.finalize();
    console.log("Seeded ai_training_data into SQLite from dummy_dataset.csv!");
});

db.close();
