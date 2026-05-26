const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
    // Enable WAL mode and busy timeout to prevent SQLITE_BUSY errors
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA busy_timeout = 5000;');
    
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
    )`, (err) => {
        db.run(`ALTER TABLE students ADD COLUMN x_coord REAL DEFAULT 0`, (err) => {});
        db.run(`ALTER TABLE students ADD COLUMN y_coord REAL DEFAULT 0`, (err) => {});
        db.run(`ALTER TABLE students ADD COLUMN learning_mode TEXT`, (err) => {});
    });

    // 2. Teachers Table
    db.run(`CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        mi TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        learning_mode TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. Classes Table
    db.run(`CREATE TABLE IF NOT EXISTS classes (
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
        // Safely attempt to add new columns to an existing table if they don't exist
        db.run(`ALTER TABLE classes ADD COLUMN year_level TEXT`, (err) => {});
        db.run(`ALTER TABLE classes ADD COLUMN section TEXT`, (err) => {});
        db.run(`ALTER TABLE classes ADD COLUMN school_year TEXT`, (err) => {});
        db.run(`ALTER TABLE classes ADD COLUMN is_archived INTEGER DEFAULT 0`, (err) => {});
        db.run(`ALTER TABLE classes ADD COLUMN learning_mode TEXT`, (err) => {});
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

    // 8. Assessment Sessions (Teacher controlled windows)
    db.run(`CREATE TABLE IF NOT EXISTS assessment_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER,
        quarter_name TEXT NOT NULL,
        deadline DATETIME,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
    )`);

    // 9. Assessment History (Tracks student changes over time)
    db.run(`CREATE TABLE IF NOT EXISTS assessment_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        session_id INTEGER,
        x_coord REAL,
        y_coord REAL,
        learning_mode TEXT,
        taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY(session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE
    )`);

    // 10. AI Settings
    db.run(`CREATE TABLE IF NOT EXISTS ai_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT
    )`, () => {
        // Initialize default settings if empty
        db.get("SELECT count(*) as count FROM ai_settings", (err, row) => {
            if (!err && row && row.count === 0) {
                const defaults = [
                    ['k_value', '5'],
                    ['weight_quiz', '1.0'],
                    ['weight_group', '1.0'],
                    ['weight_research', '1.0'],
                    ['weight_seatwork', '1.0'],
                    ['distance_metric', 'euclidean']
                ];
                const stmt = db.prepare("INSERT INTO ai_settings (setting_key, setting_value) VALUES (?, ?)");
                defaults.forEach(d => stmt.run(d));
                stmt.finalize();
            }
        });
    });

    // 11. AI Training Data (28 Questions)
    let aiCols = "";
    for(let i=1; i<=28; i++) {
        aiCols += `q${i} REAL, `;
    }
    db.run(`CREATE TABLE IF NOT EXISTS ai_training_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ${aiCols}
        target_quadrant TEXT
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
    const { first_name, last_name, mi, email, password, learning_mode } = req.body;
    
    // Basic validation
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Hash the password securely
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const sql = `INSERT INTO teachers (first_name, last_name, mi, email, password_hash, learning_mode) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [first_name, last_name, mi, email, password_hash, learning_mode || null], function(err) {
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
    db.all(`SELECT id, first_name, last_name, mi, email, learning_mode, created_at FROM teachers`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// PUT /api/teachers/:id/learning_mode - Update a teacher's learning mode
app.put('/api/teachers/:id/learning_mode', (req, res) => {
    const { learning_mode } = req.body;
    db.run(`UPDATE teachers SET learning_mode = ? WHERE id = ?`, [learning_mode, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Teacher not found' });
        res.json({ success: true });
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
    const { email, password, requested_role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    if (requested_role === 'student') {
        db.get(`SELECT * FROM students WHERE email = ?`, [email], async (err, student) => {
            if (err) return res.status(500).json({ error: err.message });
            if (student) {
                const match = await bcrypt.compare(password, student.password_hash);
                if (match) {
                    return res.json({ 
                        success: true, 
                        role: 'student', 
                        user: { 
                            id: student.id, name: student.first_name, last_name: student.last_name,
                            student_no: student.student_no, program: student.program, year_level: student.year_level, section: student.section
                        } 
                    });
                } else return res.status(401).json({ error: 'Invalid password' });
            }
            return res.status(404).json({ error: 'Student not found' });
        });
    } else if (requested_role === 'teacher') {
        db.get(`SELECT * FROM teachers WHERE email = ?`, [email], async (err, teacher) => {
            if (err) return res.status(500).json({ error: err.message });
            if (teacher) {
                const match = await bcrypt.compare(password, teacher.password_hash);
                if (match) {
                    return res.json({ 
                        success: true, role: 'teacher', 
                        user: { id: teacher.id, name: teacher.first_name, last_name: teacher.last_name } 
                    });
                } else return res.status(401).json({ error: 'Invalid password' });
            }
            return res.status(404).json({ error: 'Teacher not found' });
        });
    } else {
        // Fallback or missing role
        return res.status(400).json({ error: 'Invalid login portal' });
    }
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
    const { prog_name, year_level, section, school_year, learning_mode, teacher_id } = req.body;
    if (!prog_name || !teacher_id) {
        return res.status(400).json({ error: 'prog_name and teacher_id are required' });
    }
    
    db.run(`INSERT INTO classes (prog_name, year_level, section, school_year, learning_mode, teacher_id) VALUES (?, ?, ?, ?, ?, ?)`, 
        [prog_name, year_level, section, school_year, learning_mode || null, teacher_id], function(err) {
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

// --- ASSESSMENT SESSIONS & HISTORY APIs ---

// POST /api/classes/:id/sessions - Create an assessment session
app.post('/api/classes/:id/sessions', (req, res) => {
    const { quarter_name, deadline } = req.body;
    db.run(`INSERT INTO assessment_sessions (class_id, quarter_name, deadline) VALUES (?, ?, ?)`,
        [req.params.id, quarter_name, deadline], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, session_id: this.lastID });
    });
});

// GET /api/classes/:id/sessions - Get sessions for a class
app.get('/api/classes/:id/sessions', (req, res) => {
    db.all(`SELECT * FROM assessment_sessions WHERE class_id = ? ORDER BY created_at DESC`, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// PUT /api/sessions/:id/close - Close a session
app.put('/api/sessions/:id/close', (req, res) => {
    db.run(`UPDATE assessment_sessions SET is_active = 0 WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// GET /api/students/:id/active-sessions - Get active sessions for a student
app.get('/api/students/:id/active-sessions', (req, res) => {
    const sql = `
        SELECT s.id as session_id, s.quarter_name, s.deadline, c.prog_name as course_subj_name, c.id as class_id
        FROM assessment_sessions s
        JOIN enrollments e ON s.class_id = e.class_id
        JOIN classes c ON s.class_id = c.id
        WHERE e.student_id = ? AND s.is_active = 1 AND c.is_archived = 0
    `;
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/students/:id/history - Get assessment history
app.get('/api/students/:id/history', (req, res) => {
    const sql = `
        SELECT h.*, s.quarter_name, c.prog_name as course_subj_name 
        FROM assessment_history h
        JOIN assessment_sessions s ON h.session_id = s.id
        JOIN classes c ON s.class_id = c.id
        WHERE h.student_id = ?
        ORDER BY h.taken_at ASC
    `;
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- AI HELPER FUNCTION ---
function calculateFKNN(answersArray, trainingData, settings) {
    const K = parseInt(settings.k_value) || 5;
    const metric = settings.distance_metric || 'euclidean';

    let distances = trainingData.map(data => {
        let dist = 0;
        
        if (metric === 'euclidean') {
            let sumSq = 0;
            for(let i=1; i<=28; i++) {
                let d = Math.abs((answersArray[i-1] || 0) - data[`q${i}`]);
                sumSq += (d * d);
            }
            dist = Math.sqrt(sumSq);
        } else if (metric === 'manhattan') {
            for(let i=1; i<=28; i++) {
                dist += Math.abs((answersArray[i-1] || 0) - data[`q${i}`]);
            }
        } else if (metric === 'chebyshev') {
            let maxD = 0;
            for(let i=1; i<=28; i++) {
                let d = Math.abs((answersArray[i-1] || 0) - data[`q${i}`]);
                if (d > maxD) maxD = d;
            }
            dist = maxD;
        }

        return { mode: data.target_quadrant, distance: dist };
    });

    distances.sort((a, b) => a.distance - b.distance);
    const nearest = distances.slice(0, K);

    let memberships = {
        'Hierarchical Individual': 0,
        'Distributed Individual': 0,
        'Hierarchical Collective': 0,
        'Distributed Collective': 0
    };

    let totalWeight = 0;
    nearest.forEach(neighbor => {
        let weight = neighbor.distance === 0 ? 1000 : (1 / Math.pow(neighbor.distance, 2));
        if (memberships[neighbor.mode] !== undefined) {
            memberships[neighbor.mode] += weight;
            totalWeight += weight;
        }
    });

    let dominantMode = 'Hierarchical Individual';
    let maxWeight = -1;
    for (let m in memberships) {
        if (memberships[m] > maxWeight) {
            maxWeight = memberships[m];
            dominantMode = m;
        }
    }
    return { dominantMode, memberships };
}

// POST /api/assessments/submit-fknn - Submit academic scores and calculate using FKNN
app.post('/api/assessments/submit-fknn', (req, res) => {
    const { student_id, session_id, answersArray } = req.body;
    
    if (!student_id || !answersArray || answersArray.length !== 28) {
        return res.status(400).json({ error: 'Missing student_id or incomplete answersArray (requires 28 elements)' });
    }

    db.all(`SELECT * FROM ai_settings`, [], (err, settingsRows) => {
        if (err) return res.status(500).json({ error: err.message });
        let settings = {};
        settingsRows.forEach(r => settings[r.setting_key] = r.setting_value);

        db.all(`SELECT * FROM ai_training_data`, [], (err, trainingData) => {
            if (err) return res.status(500).json({ error: err.message });
            if (trainingData.length === 0) return res.status(500).json({ error: "No training data found." });

            const { dominantMode, memberships } = calculateFKNN(answersArray, trainingData, settings);

            // Generate coordinates so the rest of the dashboard (scatter plots, etc) doesn't break
            let finalX = 0; let finalY = 0;
            if (dominantMode.includes('Hierarchical')) finalX = -3; else finalX = 3;
            if (dominantMode.includes('Individual')) finalY = 3; else finalY = -3;

            db.serialize(() => {
                if (session_id) {
                    db.run(`INSERT INTO assessment_history (student_id, session_id, x_coord, y_coord, learning_mode) VALUES (?, ?, ?, ?, ?)`,
                        [student_id, session_id, finalX, finalY, dominantMode]);
                }

                db.run(`UPDATE students SET x_coord = ?, y_coord = ?, learning_mode = ? WHERE id = ?`, 
                    [finalX, finalY, dominantMode, student_id], 
                    function(updateErr) {
                        if (updateErr) console.error("Error updating student coords", updateErr);
                        res.json({
                            success: true,
                            result: { x: finalX, y: finalY, mode: dominantMode, fuzzy: memberships }
                        });
                    }
                );
            });
        });
    });
});


// POST /api/assessments/submit - Submit answers and calculate learning mode
app.post('/api/assessments/submit', (req, res) => {
    const { student_id, session_id, answers } = req.body;
    
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

            // Save to history if session_id is provided
            if (session_id) {
                db.run(`INSERT INTO assessment_history (student_id, session_id, x_coord, y_coord, learning_mode) VALUES (?, ?, ?, ?, ?)`,
                    [student_id, session_id, totalX, totalY, mode]);
            }

            // Save back to student profile
            db.run(`UPDATE students SET x_coord = ?, y_coord = ?, learning_mode = ? WHERE id = ?`, 
                [totalX, totalY, mode, student_id], 
                function(updateErr) {
                    if (updateErr) console.error("Error updating student coords", updateErr);
                    
                    res.json({
                        success: true,
                        result: {
                            x: totalX,
                            y: totalY,
                            mode: mode
                        }
                    });
                }
            );
        });
    });
});

// POST /api/ai/simulate - Admin endpoint to test FKNN math without saving to DB
app.post('/api/ai/simulate', (req, res) => {
    const { answersArray } = req.body;
    
    if (!answersArray || answersArray.length !== 28) return res.status(400).json({ error: 'Missing answersArray or incomplete' });

    db.all(`SELECT * FROM ai_settings`, [], (err, settingsRows) => {
        if (err) return res.status(500).json({ error: err.message });
        let settings = {};
        settingsRows.forEach(r => settings[r.setting_key] = r.setting_value);

        db.all(`SELECT * FROM ai_training_data`, [], (err, trainingData) => {
            if (err) return res.status(500).json({ error: err.message });
            if (trainingData.length === 0) return res.status(500).json({ error: "No training data found." });

            const { dominantMode, memberships } = calculateFKNN(answersArray, trainingData, settings);

            res.json({
                success: true,
                result: { mode: dominantMode, fuzzy: memberships }
            });
        });
    });
});

// POST /api/ai/upload-start - Clear old data before chunking
app.post('/api/ai/upload-start', (req, res) => {
    const { overwrite } = req.body;
    if (overwrite) {
        db.run(`DELETE FROM ai_training_data`, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: "Dataset cleared." });
        });
    } else {
        res.json({ success: true, message: "Appending to dataset." });
    }
});

// DELETE /api/ai/training-data - Clear all data
app.delete('/api/ai/training-data', (req, res) => {
    db.run(`DELETE FROM ai_training_data`, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Dataset completely deleted." });
    });
});

// GET /api/ai/training-data - Fetch top 100 rows for preview
app.get('/api/ai/training-data', (req, res) => {
    db.all(`SELECT * FROM ai_training_data ORDER BY id DESC LIMIT 100`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/ai/upload-chunk - Upload a chunk of dataset
app.post('/api/ai/upload-chunk', (req, res) => {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) return res.status(400).json({ error: 'Invalid data' });

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        let cols = []; let qs = [];
        for(let i=1; i<=28; i++) { cols.push(`q${i}`); qs.push(`?`); }
        const stmt = db.prepare(`INSERT INTO ai_training_data (${cols.join(',')}, target_quadrant) VALUES (${qs.join(',')}, ?)`);
        
        let insertedCount = 0;
        data.forEach(row => {
            let values = [];
            for(let i=1; i<=28; i++) values.push(row[`q${i}`]);
            values.push(row.target_quadrant);

            stmt.run(values, function(insertErr) {
                if (!insertErr) insertedCount++;
            });
        });
        
        stmt.finalize();
        db.run('COMMIT', (err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, count: insertedCount });
        });
    });
});

// POST /api/ai/train-metrics - Spawns Python script to generate charts
app.post('/api/ai/train-metrics', (req, res) => {
    const { exec } = require('child_process');
    // Export sqlite to CSV first so python can read it 
    db.all(`SELECT * FROM ai_training_data`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to read data" });
        if (rows.length < 50) return res.status(400).json({ error: "Need at least 50 rows to train model." });

        const fs = require('fs');
        let csv = "q1,q2,q3,q4,q5,q6,q7,q8,q9,q10,q11,q12,q13,q14,q15,q16,q17,q18,q19,q20,q21,q22,q23,q24,q25,q26,q27,q28,target_quadrant\n";
        rows.forEach(r => {
            for(let i=1; i<=28; i++) csv += `${r['q'+i]},`;
            csv += `${r.target_quadrant}\n`;
        });
        fs.writeFileSync('current_dataset.csv', csv);

        // Run Python script
        exec('python train_model.py', (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Python script failed. Is python installed?", details: stderr });
            }
            try {
                // Parse stdout for JSON
                const jsonStr = stdout.split('---JSON_START---')[1].split('---JSON_END---')[0];
                const metrics = JSON.parse(jsonStr);
                res.json({ success: true, metrics });
            } catch (e) {
                console.error(e);
                res.status(500).json({ error: "Failed to parse Python output", raw: stdout });
            }
        });
    });
});

// GET /api/ai/settings - Fetch AI model configuration
app.get('/api/ai/settings', (req, res) => {
    db.all(`SELECT * FROM ai_settings`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        let config = {};
        rows.forEach(r => config[r.setting_key] = r.setting_value);
        res.json(config);
    });
});

// POST /api/ai/settings - Update AI model configuration
app.post('/api/ai/settings', (req, res) => {
    const settings = req.body;
    db.serialize(() => {
        const stmt = db.prepare(`INSERT OR REPLACE INTO ai_settings (setting_key, setting_value) VALUES (?, ?)`);
        for (let key in settings) {
            stmt.run([key, String(settings[key])]);
        }
        stmt.finalize(() => {
            res.json({ success: true });
        });
    });
});

// GET /api/ai/stats - Fetch current dataset distribution
app.get('/api/ai/stats', (req, res) => {
    db.all(`SELECT target_quadrant as mode, COUNT(*) as count FROM ai_training_data GROUP BY target_quadrant`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        let total = 0;
        rows.forEach(r => total += r.count);
        res.json({ total, distribution: rows });
    });
});

// GET /api/ai/download - Download active AI dataset as CSV
app.get('/api/ai/download', (req, res) => {
    db.all(`SELECT * FROM ai_training_data`, [], (err, rows) => {
        if (err) return res.status(500).send("Database error");
        let csv = "";
        for(let i=1; i<=28; i++) csv += `q${i},`;
        csv += "target_quadrant\n";
        
        rows.forEach(r => {
            for(let i=1; i<=28; i++) csv += `${r['q'+i]},`;
            csv += `${r.target_quadrant}\n`;
        });
        res.header('Content-Type', 'text/csv');
        res.attachment('current_model_dataset.csv');
        return res.send(csv);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
