const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

const firstNames = [
    'Maria', 'Jose', 'Juan', 'Luis', 'Ana', 'Carlos', 'Miguel', 'Jesus', 'Pedro', 'Rosa',
    'Sofia', 'Diego', 'Mateo', 'Valentina', 'Santiago', 'Lucia', 'Isabella', 'Thiago', 'Camila', 'Alejandro',
    'Mark', 'John', 'Paul', 'Christian', 'Kevin', 'Bryan', 'Jason', 'Michael', 'Eric', 'Aaron',
    'Mary', 'Grace', 'Joy', 'Princess', 'Michelle', 'Sarah', 'Jessica', 'Nicole', 'Christine', 'Rachel',
    'Gabriel', 'Rafael', 'Daniel', 'Elias', 'David', 'Samuel', 'Lucas', 'Joaquin', 'Felipe', 'Emilio'
];

const lastNames = [
    'Garcia', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Mendoza', 'Aquino', 'Navarro', 'Torres', 'Ramos',
    'Santos', 'Flores', 'Gonzales', 'Villanueva', 'Perez', 'Castro', 'Rivera', 'Gomez', 'Diaz', 'Rojas',
    'Hernandez', 'Lopez', 'Martinez', 'Rodriguez', 'Fernandez', 'Alvarez', 'Romero', 'Herrera', 'Medina', 'Vargas',
    'Cortez', 'Sison', 'Valdez', 'De Leon', 'Dela Cruz', 'Tolentino', 'Ferrer', 'Domingo', 'Guzman', 'Ignacio'
];

function getRandomName() {
    const f = firstNames[Math.floor(Math.random() * firstNames.length)];
    const l = lastNames[Math.floor(Math.random() * lastNames.length)];
    return { f, l };
}

db.serialize(() => {
    db.all("SELECT id FROM students WHERE first_name LIKE 'Dummy %'", (err, rows) => {
        if (err) return console.error(err);

        if (!rows || rows.length === 0) {
            console.log("No 'Dummy' students found.");
            db.close();
            return;
        }

        const updateStmt = db.prepare("UPDATE students SET first_name = ?, last_name = ? WHERE id = ?");
        
        db.run('BEGIN TRANSACTION');
        rows.forEach(row => {
            const { f, l } = getRandomName();
            updateStmt.run([f, l, row.id]);
        });
        
        updateStmt.finalize();
        db.run('COMMIT', (err) => {
            if (err) console.error(err);
            else console.log(`Successfully updated ${rows.length} student names to realistic names!`);
            db.close();
        });
    });
});
