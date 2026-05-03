const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve all files in the current directory as static web files
app.use(express.static(__dirname));

// Initialize SQLite Database in the same directory
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database opening error: ', err);
    else console.log('Connected to SQLite database.');
});

// Create tables if they don't exist
db.serialize(() => {
    // 1. Students Table
    db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_no TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        mi TEXT,
        program TEXT,
        year_level TEXT,
        section TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_current INTEGER DEFAULT 1,
        x_coord REAL DEFAULT 0,
        y_coord REAL DEFAULT 0,
        learning_mode TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, () => {
        db.run(`ALTER TABLE students ADD COLUMN x_coord REAL DEFAULT 0`, () => {});
        db.run(`ALTER TABLE students ADD COLUMN y_coord REAL DEFAULT 0`, () => {});
        db.run(`ALTER TABLE students ADD COLUMN learning_mode TEXT`, () => {});
    });

    // 2. Teachers Table
    db.run(`CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        mi TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. Classes Table
    db.run(`CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_subj_name TEXT NOT NULL,
        year_level TEXT,
        section TEXT,
        school_year TEXT,
        teacher_id INTEGER,
        is_archived INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
    )`, () => {
        // Safely attempt to add new columns to an existing table if they don't exist
        db.run(`ALTER TABLE classes ADD COLUMN year_level TEXT`, () => {});
        db.run(`ALTER TABLE classes ADD COLUMN section TEXT`, () => {});
        db.run(`ALTER TABLE classes ADD COLUMN school_year TEXT`, () => {});
        db.run(`ALTER TABLE classes ADD COLUMN is_archived INTEGER DEFAULT 0`, () => {});
    });

    // 4. Enrollments Table (Many-to-Many: Students to Classes)
    db.run(`CREATE TABLE IF NOT EXISTS enrollments (
        student_id INTEGER,
        class_id INTEGER,
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (student_id, class_id),
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
    )`);

    // 5. Questions Table (Already exists)
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL
    )`);

    // 6. Answers Table (Already exists - holds text and x,y coordinates)
    db.run(`CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        text TEXT NOT NULL,
        x_value REAL,
        y_value REAL,
        FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
    )`);

    // 7. Student Responses Table (Links a student to the answer they picked)
    db.run(`CREATE TABLE IF NOT EXISTS student_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        question_id INTEGER,
        answer_id INTEGER,
        answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY(answer_id) REFERENCES answers(id) ON DELETE CASCADE
    )`);
});

// --- API ENDPOINTS ---

// POST /api/students/register - Register a new student
app.post('/api/students/register', async (req, res) => {
    const { student_no, first_name, last_name, mi, program, year_level, section, email, password } = req.body;
    
    // Basic validation
    if (!student_no || !first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Hash the password securely
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const sql = `INSERT INTO students (student_no, first_name, last_name, mi, program, year_level, section, email, password_hash) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [student_no, first_name, last_name, mi, program, year_level, section, email, password_hash], function(err) {
            if (err) {
                // If the email or student no already exists, SQLite throws a constraint error
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Email or Student Number already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ success: true, message: 'Student registered successfully!', student_id: this.lastID });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// POST /api/teachers/register - Register a new teacher
app.post('/api/teachers/register', async (req, res) => {
    const { first_name, last_name, mi, email, password } = req.body;
    
    // Basic validation
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Hash the password securely
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const sql = `INSERT INTO teachers (first_name, last_name, mi, email, password_hash) 
                     VALUES (?, ?, ?, ?, ?)`;
        
        db.run(sql, [first_name, last_name, mi, email, password_hash], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ success: true, message: 'Teacher registered successfully!', teacher_id: this.lastID });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// GET /api/students - Fetch all students
app.get('/api/students', (req, res) => {
    db.all(`SELECT id, student_no, first_name, last_name, mi, program, year_level, section, email, is_current, created_at FROM students`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/teachers - Fetch all teachers
app.get('/api/teachers', (req, res) => {
    db.all(`SELECT id, first_name, last_name, mi, email, created_at FROM teachers`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/students/:id - Get a specific student's full profile
app.get('/api/students/:id', (req, res) => {
    db.get(`SELECT id, student_no, first_name, last_name, mi, email, program, year_level, section, x_coord, y_coord, learning_mode FROM students WHERE id = ?`, [req.params.id], (err, student) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    });
});

// POST /api/login - Universal login for Students and Teachers
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // 1. Check if user is a student
    db.get(`SELECT * FROM students WHERE email = ?`, [email], async (err, student) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (student) {
            const match = await bcrypt.compare(password, student.password_hash);
            if (match) {
                return res.json({ 
                    success: true, 
                    role: 'student', 
                    user: { 
                        id: student.id, 
                        name: student.first_name, 
                        last_name: student.last_name,
                        student_no: student.student_no,
                        program: student.program,
                        year_level: student.year_level,
                        section: student.section
                    } 
                });
            } else {
                return res.status(401).json({ error: 'Invalid password' });
            }
        }

        // 2. If not a student, check if user is a teacher
        db.get(`SELECT * FROM teachers WHERE email = ?`, [email], async (err, teacher) => {
            if (err) return res.status(500).json({ error: err.message });

            if (teacher) {
                const match = await bcrypt.compare(password, teacher.password_hash);
                if (match) {
                    return res.json({ 
                        success: true, 
                        role: 'teacher', 
                        user: { 
                            id: teacher.id, 
                            name: teacher.first_name,
                            last_name: teacher.last_name
                        } 
                    });
                } else {
                    return res.status(401).json({ error: 'Invalid password' });
                }
            }

            // 3. User not found in either table
            return res.status(404).json({ error: 'User not found' });
        });
    });
});

// --- CLASS & ENROLLMENT APIs ---

// GET /api/classes - Fetch all classes
app.get('/api/classes', (req, res) => {
    const sql = `
        SELECT c.*, t.first_name as teacher_first_name, t.last_name as teacher_last_name 
        FROM classes c
        LEFT JOIN teachers t ON c.teacher_id = t.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/classes/details/:id - Fetch single class details
app.get('/api/classes/details/:id', (req, res) => {
    const sql = `SELECT * FROM classes WHERE id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Class not found' });
        res.json(row);
    });
});

// GET /api/classes/teacher/:teacher_id - Fetch classes for a specific teacher
app.get('/api/classes/teacher/:teacher_id', (req, res) => {
    // Only return non-archived classes by default
    const sql = `SELECT * FROM classes WHERE teacher_id = ? AND is_archived = 0`;
    db.all(sql, [req.params.teacher_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// PUT /api/classes/:id/archive - Archive a class
app.put('/api/classes/:id/archive', (req, res) => {
    db.run(`UPDATE classes SET is_archived = 1 WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Class archived' });
    });
});

// PUT /api/classes/:id/unarchive - Unarchive a class
app.put('/api/classes/:id/unarchive', (req, res) => {
    db.run(`UPDATE classes SET is_archived = 0 WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Class unarchived' });
    });
});

// DELETE /api/classes/:id - Permanently delete a class and its enrollments
app.delete('/api/classes/:id', (req, res) => {
    // Delete enrollments first (if cascade isn't fully enabled in sqlite config)
    db.run(`DELETE FROM enrollments WHERE class_id = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run(`DELETE FROM classes WHERE id = ?`, [req.params.id], function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ success: true, message: 'Class deleted' });
        });
    });
});

// POST /api/classes - Create a new class
app.post('/api/classes', (req, res) => {
    const { course_subj_name, year_level, section, school_year, teacher_id } = req.body;
    if (!course_subj_name || !teacher_id) {
        return res.status(400).json({ error: 'course_subj_name and teacher_id are required' });
    }
    
    db.run(`INSERT INTO classes (course_subj_name, year_level, section, school_year, teacher_id) VALUES (?, ?, ?, ?, ?)`, 
        [course_subj_name, year_level, section, school_year, teacher_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ success: true, class_id: this.lastID });
    });
});

// POST /api/enroll - Enroll a student in a class
app.post('/api/enroll', (req, res) => {
    const { student_id, class_id } = req.body;
    if (!student_id || !class_id) {
        return res.status(400).json({ error: 'student_id and class_id are required' });
    }

    // Enforce rule: A student can only be enrolled in ONE active class at a time
    const checkSql = `
        SELECT c.id 
        FROM enrollments e
        JOIN classes c ON e.class_id = c.id
        WHERE e.student_id = ? AND c.is_archived = 0
    `;
    
    db.get(checkSql, [student_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (row) {
            return res.status(409).json({ error: 'Student is already enrolled in an active class' });
        }

        db.run(`INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)`, [student_id, class_id], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Student is already enrolled in this class' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ success: true, message: 'Successfully enrolled' });
        });
    });
});

// GET /api/students/:id/classes - Get all classes a student is enrolled in
app.get('/api/students/:id/classes', (req, res) => {
    const sql = `
        SELECT c.*, t.first_name as teacher_first_name, t.last_name as teacher_last_name
        FROM classes c
        JOIN enrollments e ON c.id = e.class_id
        LEFT JOIN teachers t ON c.teacher_id = t.id
        WHERE e.student_id = ?
    `;
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/classes/:id/students - Get all students enrolled in a specific class
app.get('/api/classes/:id/students', (req, res) => {
    const sql = `
        SELECT s.id, s.student_no, s.first_name, s.last_name, s.email, s.program, s.year_level, s.section, s.x_coord, s.y_coord, s.learning_mode
        FROM students s
        JOIN enrollments e ON s.id = e.student_id
        WHERE e.class_id = ?
    `;
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/questions - Fetch all questions and their answers
app.get('/api/questions', (req, res) => {
    db.all(`SELECT * FROM questions`, [], (err, questions) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.all(`SELECT * FROM answers`, [], (err, answers) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Map answers to their respective questions
            const questionsWithAnswers = questions.map(q => {
                return {
                    id: q.id,
                    title: q.title,
                    answers: answers.filter(a => a.question_id === q.id).map(a => ({
                        id: a.id,
                        text: a.text,
                        x: a.x_value,
                        y: a.y_value
                    }))
                };
            });
            res.json(questionsWithAnswers);
        });
    });
});

// POST /api/questions - Add a new question
app.post('/api/questions', (req, res) => {
    const { title, answers } = req.body;
    if (!title || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    db.run(`INSERT INTO questions (title) VALUES (?)`, [title], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const questionId = this.lastID;

        const stmt = db.prepare(`INSERT INTO answers (question_id, text, x_value, y_value) VALUES (?, ?, ?, ?)`);
        answers.forEach(a => {
            stmt.run([questionId, a.text, a.x, a.y]);
        });
        stmt.finalize();

        res.json({ success: true, id: questionId });
    });
});

// DELETE /api/questions/:id - Delete a question
app.delete('/api/questions/:id', (req, res) => {
    const id = req.params.id;
    // Delete answers first (SQLite foreign keys ON DELETE CASCADE might need pragma to be enabled, so we explicitly delete here to be safe)
    db.run(`DELETE FROM answers WHERE question_id = ?`, id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run(`DELETE FROM questions WHERE id = ?`, id, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, deleted: this.changes });
        });
    });
});

// POST /api/assessments/submit - Submit answers and calculate learning mode
app.post('/api/assessments/submit', (req, res) => {
    const { student_id, answers } = req.body;
    
    if (!student_id || !answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ error: 'Missing student_id or answers' });
    }

    let totalX = 0;
    let totalY = 0;

    const placeholders = answers.map(() => '?').join(',');
    db.all(`SELECT id, question_id, x_value, y_value FROM answers WHERE id IN (${placeholders})`, answers, (err, answerRows) => {
        if (err) return res.status(500).json({ error: err.message });

        db.serialize(() => {
            const stmt = db.prepare(`INSERT INTO student_responses (student_id, question_id, answer_id) VALUES (?, ?, ?)`);
            
            answerRows.forEach(row => {
                stmt.run([student_id, row.question_id, row.id]);
                totalX += row.x_value;
                totalY += row.y_value;
            });
            stmt.finalize();

            let mode = 'Unknown';
            if (totalX <= 0 && totalY >= 0) mode = 'Hierarchical Individual';
            if (totalX > 0 && totalY >= 0) mode = 'Distributed Individual';
            if (totalX <= 0 && totalY < 0) mode = 'Hierarchical Collective';
            if (totalX > 0 && totalY < 0) mode = 'Distributed Collective';

            // Save back to student profile
            db.run(`UPDATE students SET x_coord = ?, y_coord = ?, learning_mode = ? WHERE id = ?`, 
                [totalX, totalY, mode, student_id], 
                function(updateErr) {
                    if (updateErr) console.error("Error updating student coords", updateErr);
                    
                    res.json({ success: true, result: { totalX, totalY, mode } });
            });
        });
    });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
