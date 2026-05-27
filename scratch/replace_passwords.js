const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
const bcrypt = require('bcrypt');

async function updatePasswords() {
    console.log("Generating hash for 'Password@123'...");
    const hash = await bcrypt.hash('Password@123', 10);
    
    db.serialize(() => {
        db.all("SELECT id FROM students WHERE email != 'juan@student.edu'", (err, rows) => {
            if (err) return console.error(err);

            if (!rows || rows.length === 0) {
                console.log("No students found to update.");
                db.close();
                return;
            }

            const updateStmt = db.prepare("UPDATE students SET password_hash = ? WHERE id = ?");
            let updatesDone = 0;
            
            rows.forEach(row => {
                updateStmt.run([hash, row.id], (err) => {
                    if (err) console.error(err);
                    updatesDone++;
                    if (updatesDone === rows.length) {
                        console.log(`Successfully updated ${rows.length} student passwords to Password@123!`);
                        updateStmt.finalize();
                        db.close();
                    }
                });
            });
        });
    });
}

updatePasswords();
