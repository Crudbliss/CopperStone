const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const csvPath = path.join(__dirname, 'synthetic_training_data.csv');
const csvData = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvData.trim().split('\n');
const headers = lines[0].split(',');

db.serialize(() => {
    // Clear existing data
    db.run(`DELETE FROM ai_training_data`);

    // Insert data
    const stmt = db.prepare(`INSERT INTO ai_training_data (hi_score, hc_score, di_score, dc_score, target_quadrant) VALUES (?, ?, ?, ?, ?)`);
    
    let count = 0;
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const row = lines[i].split(',');
        if (row.length === 5) {
            stmt.run([parseFloat(row[0]), parseFloat(row[1]), parseFloat(row[2]), parseFloat(row[3]), row[4].trim()]);
            count++;
        }
    }
    
    stmt.finalize();
    console.log(`Seeded ${count} rows into ai_training_data from synthetic_training_data.csv!`);
});

db.close();
