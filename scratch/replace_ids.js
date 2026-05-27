const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    // Select all students EXCEPT Juan Dela Cruz (assuming juan is the real user)
    // Actually, I'll just select students whose email contains 'student.edu' and isn't juan.
    db.all("SELECT id FROM students WHERE email != 'juan@student.edu'", (err, rows) => {
        if (err) return console.error(err);

        if (!rows || rows.length === 0) {
            console.log("No students found to update.");
            db.close();
            return;
        }

        const updateStmt = db.prepare("UPDATE students SET student_no = ? WHERE id = ?");
        
        db.run('BEGIN TRANSACTION');
        let counter = 1;
        rows.forEach(row => {
            const paddedId = counter.toString().padStart(4, '0');
            const newStudentNo = `0226${paddedId}`;
            updateStmt.run([newStudentNo, row.id]);
            counter++;
        });
        
        updateStmt.finalize();
        db.run('COMMIT', (err) => {
            if (err) console.error(err);
            else console.log(`Successfully updated ${rows.length} student IDs to the new format (e.g. 02260001)!`);
            db.close();
        });
    });
});
