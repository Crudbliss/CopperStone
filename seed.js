const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./database.sqlite');

async function seed() {
    const saltRounds = 10;
    const defaultPassword = await bcrypt.hash('password123', saltRounds);

    console.log("Seeding dummy data...");

    db.serialize(() => {
        // --- SEED TEACHERS ---
        const stmtTeacher = db.prepare(`INSERT INTO teachers (first_name, last_name, mi, email, password_hash) VALUES (?, ?, ?, ?, ?)`);
        
        const teachers = [
            ['Alice', 'Johnson', 'M', 'alice.teacher@example.com'],
            ['Bob', 'Smith', 'T', 'bob.teacher@example.com']
        ];

        teachers.forEach(t => stmtTeacher.run([...t, defaultPassword]));
        stmtTeacher.finalize();

        // --- SEED STUDENTS ---
        const stmtStudent = db.prepare(`INSERT INTO students (student_no, first_name, last_name, mi, program, year_level, section, email, password_hash, is_current) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        const students = [
            ['2022-0001', 'Juan', 'Dela Cruz', 'A', 'BSIT', '3', 'A', 'juan@example.com'],
            ['2022-0002', 'Maria', 'Clara', 'B', 'BSIT', '3', 'A', 'maria@example.com'],
            ['2022-0003', 'Jose', 'Rizal', 'P', 'BSIT', '3', 'A', 'jose@example.com'],
            ['2022-0004', 'Andres', 'Bonifacio', 'C', 'BSIT', '3', 'B', 'andres@example.com'],
            ['2022-0005', 'Emilio', 'Aguinaldo', 'F', 'BSCS', '2', 'C', 'emilio@example.com'],
            ['2022-0006', 'Apolinario', 'Mabini', 'M', 'BSIT', '3', 'A', 'apolinario@example.com'],
            ['2022-0007', 'Marcelo', 'Del Pilar', 'H', 'BSCS', '2', 'C', 'marcelo@example.com'],
            ['2022-0008', 'Gabriela', 'Silang', 'D', 'BSIT', '3', 'B', 'gabriela@example.com'],
            ['2022-0009', 'Tandang', 'Sora', 'Q', 'BSCS', '2', 'A', 'sora@example.com'],
            ['2022-0010', 'Melchora', 'Aquino', 'R', 'BSIT', '3', 'B', 'melchora@example.com']
        ];

        students.forEach(s => stmtStudent.run([...s, defaultPassword, 1]));
        stmtStudent.finalize();

        // Let's insert a couple of classes manually, but since we don't easily know teacher IDs, 
        // we'll fetch them first. Let's just do an INSERT SELECT style or do it in a callback.
        
        db.all("SELECT id FROM teachers LIMIT 2", (err, tRows) => {
            if (err || tRows.length === 0) return console.error("No teachers found.");
            
            const teacherId1 = tRows[0].id;
            
            // --- SEED CLASSES ---
            const stmtClass = db.prepare(`INSERT INTO classes (course_subj_name, year_level, section, school_year, teacher_id) VALUES (?, ?, ?, ?, ?)`);
            stmtClass.run('Web Development 101', '3', 'A', '2025-2026', teacherId1);
            stmtClass.run('Data Structures', '2', 'C', '2025-2026', teacherId1);
            stmtClass.run('Software Engineering', '3', 'B', '2025-2026', teacherId1);
            stmtClass.finalize();

            // After inserting classes, let's enroll some students
            db.all("SELECT id, year_level, section FROM classes WHERE teacher_id = ?", [teacherId1], (err, cRows) => {
                if (err) return console.error(err);
                
                db.all("SELECT id, year_level, section FROM students", (err, sRows) => {
                    if (err) return console.error(err);
                    
                    const stmtEnroll = db.prepare(`INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)`);
                    
                    let enrollCount = 0;
                    cRows.forEach(cls => {
                        // Enroll students whose year and section match the class loosely
                        sRows.forEach(stu => {
                            if (stu.year_level === cls.year_level && stu.section === cls.section) {
                                stmtEnroll.run(stu.id, cls.id, (err) => {
                                    if(!err) enrollCount++;
                                });
                            }
                        });
                    });
                    
                    stmtEnroll.finalize(() => {
                        console.log("Successfully seeded dummy Teachers, Students, Classes, and auto-enrolled them based on matching Year/Section!");
                        console.log("All dummy accounts use password: password123");
                        db.close();
                    });
                });
            });
        });
    });
}

seed();
