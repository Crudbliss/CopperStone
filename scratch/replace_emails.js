const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    db.all("SELECT id, first_name, last_name, email FROM students WHERE email != 'juan@student.edu'", (err, rows) => {
        if (err) return console.error(err);

        if (!rows || rows.length === 0) {
            console.log("No students found to update.");
            db.close();
            return;
        }

        const updateStmt = db.prepare("UPDATE students SET email = ? WHERE id = ?");
        const emailSet = new Set();
        
        let updatesDone = 0;
        rows.forEach(row => {
            if (!row.first_name || !row.last_name) {
                updatesDone++;
                return;
            }
            
            const firstInitial = row.first_name.charAt(0).toLowerCase().replace(/[^a-z]/g, '');
            const lastName = row.last_name.toLowerCase().replace(/[^a-z]/g, '');
            let baseEmail = `${firstInitial}${lastName}@student.edu`;
            let email = baseEmail;
            
            let counter = 2;
            while (emailSet.has(email)) {
                email = `${firstInitial}${lastName}${counter}@student.edu`;
                counter++;
            }
            emailSet.add(email);
            
            db.run("UPDATE students SET email = ? WHERE id = ?", [email, row.id], (err) => {
                if (err) console.error(err);
                updatesDone++;
                if (updatesDone === rows.length) {
                    console.log(`Successfully updated ${rows.length} student emails to the requested format!`);
                    db.close();
                }
            });
        });
    });
});
