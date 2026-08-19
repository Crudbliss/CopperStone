const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const multer = require('multer');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads', 'modules');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for PDF uploads
const moduleStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});
const uploadModule = multer({ storage: moduleStorage });


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
        db.run(`ALTER TABLE students ADD COLUMN weakest_learning_mode TEXT`, (err) => {});
    });

    // 2. Assessment History (Tracks student changes over time)
    db.run(`CREATE TABLE IF NOT EXISTS assessment_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        session_id INTEGER DEFAULT 0,
        x_coord REAL,
        y_coord REAL,
        learning_mode TEXT,
        taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
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

    // 12. Modules (Learning content)
    db.run(`CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        quadrant_category TEXT DEFAULT 'All',
        difficulty TEXT DEFAULT 'Beginner',
        topic TEXT DEFAULT 'General',
        estimated_time TEXT DEFAULT '30 min',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        db.run(`ALTER TABLE modules ADD COLUMN quadrant_category TEXT DEFAULT 'All'`, (err) => {});
        db.run(`ALTER TABLE modules ADD COLUMN difficulty TEXT DEFAULT 'Beginner'`, (err) => {});
        db.run(`ALTER TABLE modules ADD COLUMN topic TEXT DEFAULT 'General'`, (err) => {});
        db.run(`ALTER TABLE modules ADD COLUMN estimated_time TEXT DEFAULT '30 min'`, (err) => {});
    });

    // 12b. Module Chapters (Chapters inside a module)
    db.run(`CREATE TABLE IF NOT EXISTS module_chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER NOT NULL,
        chapter_order INTEGER DEFAULT 1,
        title TEXT NOT NULL,
        text_content TEXT,
        pdf_url TEXT,
        youtube_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE
    )`);

    // 12c. Module Questions (Quiz & Activities: True/False, Multiple Choice, Matching)
    db.run(`CREATE TABLE IF NOT EXISTS module_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER NOT NULL,
        chapter_id INTEGER,
        question_type TEXT NOT NULL,
        question_order INTEGER DEFAULT 1,
        question_text TEXT NOT NULL,
        options_json TEXT,
        correct_answer_json TEXT,
        explanation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE,
        FOREIGN KEY(chapter_id) REFERENCES module_chapters(id) ON DELETE CASCADE
    )`);

    // 13. Submissions (Gradebook)
    db.run(`CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        module_id INTEGER,
        student_answer_payload TEXT,
        score INTEGER DEFAULT 0,
        teacher_feedback TEXT,
        grading_status TEXT DEFAULT 'Needs Grading',
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE
    )`);

    // 14. Announcements
    db.run(`CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER,
        title TEXT NOT NULL,
        message_body TEXT,
        target_audience TEXT,
        view_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    )`);

    // 15. Student Module Progress
    db.run(`CREATE TABLE IF NOT EXISTS student_module_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        module_id INTEGER,
        tasks_completed INTEGER DEFAULT 0,
        total_tasks INTEGER DEFAULT 1,
        status TEXT DEFAULT 'In Progress',
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE
    )`);
});

// --- API ENDPOINTS ---

// POST /api/students/register - Register a new student
app.post('/api/students/register', async (req, res) => {
    let { student_no, first_name, last_name, mi, program, year_level, section, email, password } = req.body;
    
    // Basic validation
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        if (!student_no || student_no.trim() === '') {
            const row = await new Promise((resolve, reject) => {
                db.get("SELECT MAX(id) as maxId FROM students", (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            const nextId = (row.maxId || 0) + 1;
            student_no = `0226${nextId.toString().padStart(4, '0')}`;
        }

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
    db.all(`SELECT id, student_no, first_name, last_name, mi, program, year_level, section, email, is_current, x_coord, y_coord, learning_mode, created_at FROM students`, [], (err, rows) => {
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

// POST /api/admin/reset-students - Wipe all assessment data and enrollments for students
app.post('/api/admin/reset-students', (req, res) => {
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run('DELETE FROM assessment_history');
        db.run('UPDATE students SET x_coord = NULL, y_coord = NULL, learning_mode = NULL', (err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to reset students' });
            }
            db.run('COMMIT');
            res.json({ success: true, message: 'All student assessment data has been completely wiped.' });
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

// --- ASSESSMENT SESSIONS & HISTORY APIs ---

// POST /api/classes/:id/sessions - Create an assessment session
app.post('/api/classes/:id/sessions', (req, res) => {
    const { quarter_name, start_date, deadline } = req.body;
    
    // Helper to format Date to YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    if (quarter_name === 'Prelim' && start_date) {
        const prelimStart = new Date(start_date);
        
        const midtermStart = new Date(prelimStart);
        midtermStart.setDate(midtermStart.getDate() + 42); // +6 weeks
        
        const finalStart = new Date(prelimStart);
        finalStart.setDate(finalStart.getDate() + 84); // +12 weeks
        
        const prelimDeadline = new Date(midtermStart);
        prelimDeadline.setDate(prelimDeadline.getDate() + 1); // Midterm + 1 day
        
        const midtermDeadline = new Date(finalStart);
        midtermDeadline.setDate(midtermDeadline.getDate() + 1); // Final + 1 day
        
        const finalDeadline = new Date(finalStart);
        finalDeadline.setDate(finalDeadline.getDate() + 42); // Final + 6 weeks
        
        db.serialize(() => {
            db.run(`INSERT INTO assessment_sessions (class_id, quarter_name, start_date, deadline) VALUES (?, ?, ?, ?)`,
                [req.params.id, 'Prelim', start_date, formatDate(prelimDeadline)]);
            db.run(`INSERT INTO assessment_sessions (class_id, quarter_name, start_date, deadline) VALUES (?, ?, ?, ?)`,
                [req.params.id, 'Midterm', formatDate(midtermStart), formatDate(midtermDeadline)]);
            db.run(`INSERT INTO assessment_sessions (class_id, quarter_name, start_date, deadline) VALUES (?, ?, ?, ?)`,
                [req.params.id, 'Final', formatDate(finalStart), formatDate(finalDeadline)], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, message: 'Cascading sessions created' });
            });
        });
    } else {
        db.run(`INSERT INTO assessment_sessions (class_id, quarter_name, start_date, deadline) VALUES (?, ?, ?, ?)`,
            [req.params.id, quarter_name, start_date, deadline], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, session_id: this.lastID });
        });
    }
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

// PUT /api/sessions/:id/dates - Update a session's dates
app.put('/api/sessions/:id/dates', (req, res) => {
    const { start_date, deadline } = req.body;
    db.run(`UPDATE assessment_sessions SET start_date = ?, deadline = ? WHERE id = ?`, [start_date, deadline, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// GET /api/students/:id/active-sessions - Get active sessions for a student
app.get('/api/students/:id/active-sessions', (req, res) => {
    db.get(`SELECT learning_mode FROM students WHERE id = ?`, [req.params.id], (err, student) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (student && (!student.learning_mode || student.learning_mode === 'null' || student.learning_mode === '')) {
            // Global Intake Assessment override
            return res.json([{
                session_id: 0, // Fake ID for Intake
                quarter_name: 'Prelim', // Act as Prelim for timeline UI
                deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
                course_subj_name: 'Global Intake',
                class_id: 0
            }]);
        }

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
});

// GET /api/students/:id/history - Get assessment history
app.get('/api/students/:id/history', (req, res) => {
    const sql = `
        SELECT h.*, COALESCE(s.quarter_name, 'Assessment ' || h.id) as quarter_name, COALESCE(c.prog_name, 'Self-Paced Track') as course_subj_name 
        FROM assessment_history h
        LEFT JOIN assessment_sessions s ON h.session_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE h.student_id = ?
        ORDER BY h.taken_at ASC, h.id ASC
    `;
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (rows && rows.length > 0) {
            return res.json(rows);
        }
        
        db.get('SELECT id, learning_mode, x_coord, y_coord FROM students WHERE id = ?', [req.params.id], (err2, student) => {
            if (err2 || !student || !student.learning_mode || student.learning_mode === 'Unknown') {
                return res.json([]);
            }
            res.json([{
                id: 1,
                student_id: student.id,
                session_id: 0,
                x_coord: student.x_coord || 0,
                y_coord: student.y_coord || 0,
                learning_mode: student.learning_mode,
                quarter_name: 'Baseline',
                course_subj_name: 'Initial Assessment',
                taken_at: new Date().toISOString()
            }]);
        });
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

            let totalWeight = 0;
            for (let m in memberships) { totalWeight += memberships[m]; }
            
            let finalX = 0; let finalY = 0;
            if (totalWeight > 0) {
                const hWeight = (memberships['Hierarchical Individual'] || 0) + (memberships['Hierarchical Collective'] || 0);
                const dWeight = (memberships['Distributed Individual'] || 0) + (memberships['Distributed Collective'] || 0);
                finalX = ((dWeight - hWeight) / totalWeight) * 5;

                const cWeight = (memberships['Hierarchical Collective'] || 0) + (memberships['Distributed Collective'] || 0);
                const iWeight = (memberships['Hierarchical Individual'] || 0) + (memberships['Distributed Individual'] || 0);
                finalY = ((iWeight - cWeight) / totalWeight) * 5;
                
                finalX = Math.round(finalX * 100) / 100;
                finalY = Math.round(finalY * 100) / 100;
            } else {
                if (dominantMode.includes('Hierarchical')) finalX = -3; else finalX = 3;
                if (dominantMode.includes('Individual')) finalY = 3; else finalY = -3;
            }

            const oppositeModes = {
                'Hierarchical Individual': 'Distributed Collective',
                'Distributed Collective': 'Hierarchical Individual',
                'Hierarchical Collective': 'Distributed Individual',
                'Distributed Individual': 'Hierarchical Collective'
            };
            const weakestMode = oppositeModes[dominantMode] || 'Unknown';

            db.serialize(() => {
                db.run(`INSERT INTO assessment_history (student_id, session_id, x_coord, y_coord, learning_mode) VALUES (?, ?, ?, ?, ?)`,
                    [student_id, session_id || 0, finalX, finalY, dominantMode],
                    function(histErr) {
                        if (histErr) console.error("Error inserting assessment history:", histErr);
                    }
                );

                db.run(`UPDATE students SET x_coord = ?, y_coord = ?, learning_mode = ?, weakest_learning_mode = ? WHERE id = ?`, 
                    [finalX, finalY, dominantMode, weakestMode, student_id], 
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
            db.run(`DELETE FROM sqlite_sequence WHERE name='ai_training_data'`, (seqErr) => {
                if (seqErr) console.error("Error resetting sequence:", seqErr);
                res.json({ success: true, message: "Dataset cleared." });
            });
        });
    } else {
        res.json({ success: true, message: "Appending to dataset." });
    }
});

// DELETE /api/ai/training-data - Clear all data
app.delete('/api/ai/training-data', (req, res) => {
    db.run(`DELETE FROM ai_training_data`, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.run(`DELETE FROM sqlite_sequence WHERE name='ai_training_data'`, (seqErr) => {
            if (seqErr) console.error("Error resetting sequence:", seqErr);
            res.json({ success: true, message: "Dataset completely deleted." });
        });
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

// ==========================================
// LMS FEATURES API ENDPOINTS
// ==========================================

// --- MODULES ---
// GET /api/modules - Fetch all modules with chapter counts
app.get('/api/modules', (req, res) => {
    const { quadrant_category } = req.query;
    let sql = `
        SELECT m.*, 
            (SELECT COUNT(*) FROM module_chapters mc WHERE mc.module_id = m.id) AS chapter_count
        FROM modules m
        WHERE 1=1
    `;
    let params = [];
    
    if (quadrant_category && quadrant_category !== 'All') {
        sql += ` AND (m.quadrant_category = ? OR m.quadrant_category = 'All')`;
        params.push(quadrant_category);
    }
    
    sql += ` ORDER BY m.created_at DESC`;
    
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/modules/:id - Fetch single module with all chapters and quiz questions
app.get('/api/modules/:id', (req, res) => {
    const moduleId = req.params.id;
    db.get(`SELECT * FROM modules WHERE id = ?`, [moduleId], (err, moduleRow) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!moduleRow) return res.status(404).json({ error: 'Module not found' });

        db.all(`SELECT * FROM module_chapters WHERE module_id = ? ORDER BY chapter_order ASC, id ASC`, [moduleId], (err2, chapterRows) => {
            if (err2) return res.status(500).json({ error: err2.message });
            moduleRow.chapters = chapterRows || [];
            
            db.all(`SELECT * FROM module_questions WHERE module_id = ? ORDER BY question_order ASC, id ASC`, [moduleId], (err3, questionRows) => {
                if (err3) return res.status(500).json({ error: err3.message });
                moduleRow.questions = (questionRows || []).map(q => {
                    try { q.options = JSON.parse(q.options_json || '[]'); } catch(e) { q.options = []; }
                    try { q.correct_answer = JSON.parse(q.correct_answer_json || 'null'); } catch(e) { q.correct_answer = q.correct_answer_json; }
                    return q;
                });
                res.json(moduleRow);
            });
        });
    });
});

// POST /api/modules - Create a new module
app.post('/api/modules', (req, res) => {
    const { title, description, quadrant_category, difficulty, topic, estimated_time } = req.body || {};
    
    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Module title is required' });
    }

    const sql = `INSERT INTO modules (title, description, quadrant_category, difficulty, topic, estimated_time) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
        title.trim(), 
        description || '', 
        quadrant_category || 'All', 
        difficulty || 'Beginner', 
        topic || 'General', 
        estimated_time || '30 min'
    ], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ success: true, module_id: this.lastID, message: 'Module created successfully' });
    });
});

// PUT /api/modules/:id - Update an existing module
app.put('/api/modules/:id', (req, res) => {
    const moduleId = req.params.id;
    const { title, description, quadrant_category, difficulty, topic, estimated_time } = req.body || {};

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Module title is required' });
    }

    const sql = `UPDATE modules SET title = ?, description = ?, quadrant_category = ?, difficulty = ?, topic = ?, estimated_time = ? WHERE id = ?`;
    db.run(sql, [
        title.trim(), 
        description || '', 
        quadrant_category || 'All', 
        difficulty || 'Beginner', 
        topic || 'General', 
        estimated_time || '30 min',
        moduleId
    ], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Module updated successfully' });
    });
});

// DELETE /api/modules/:id - Delete a module and all its chapters & questions
app.delete('/api/modules/:id', (req, res) => {
    const moduleId = req.params.id;
    db.serialize(() => {
        db.run(`DELETE FROM module_chapters WHERE module_id = ?`, [moduleId]);
        db.run(`DELETE FROM module_questions WHERE module_id = ?`, [moduleId]);
        db.run(`DELETE FROM submissions WHERE module_id = ?`, [moduleId]);
        db.run(`DELETE FROM student_module_progress WHERE module_id = ?`, [moduleId]);
        db.run(`DELETE FROM modules WHERE id = ?`, [moduleId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Module deleted successfully' });
        });
    });
});

// --- CHAPTERS ---
// POST /api/modules/:id/chapters - Add a chapter to a module
app.post('/api/modules/:id/chapters', (req, res) => {
    const moduleId = req.params.id;
    const { title, chapter_order, text_content, pdf_url, youtube_url } = req.body || {};

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Chapter title is required' });
    }

    const sql = `INSERT INTO module_chapters (module_id, chapter_order, title, text_content, pdf_url, youtube_url) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
        moduleId, 
        parseInt(chapter_order) || 1, 
        title.trim(), 
        text_content || '', 
        pdf_url || '', 
        youtube_url || ''
    ], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ success: true, chapter_id: this.lastID, message: 'Chapter added successfully' });
    });
});

// PUT /api/chapters/:id - Edit a chapter
app.put('/api/chapters/:id', (req, res) => {
    const chapterId = req.params.id;
    const { title, chapter_order, text_content, pdf_url, youtube_url } = req.body || {};

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Chapter title is required' });
    }

    const sql = `UPDATE module_chapters SET title = ?, chapter_order = ?, text_content = ?, pdf_url = ?, youtube_url = ? WHERE id = ?`;
    db.run(sql, [
        title.trim(), 
        parseInt(chapter_order) || 1, 
        text_content || '', 
        pdf_url || '', 
        youtube_url || '',
        chapterId
    ], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Chapter updated successfully' });
    });
});

// DELETE /api/chapters/:id - Delete a chapter
app.delete('/api/chapters/:id', (req, res) => {
    const chapterId = req.params.id;
    db.run(`DELETE FROM module_chapters WHERE id = ?`, [chapterId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Chapter deleted successfully' });
    });
});

// --- QUIZ & QUESTIONS ---
// GET /api/modules/:id/questions - Fetch quiz questions for a module
app.get('/api/modules/:id/questions', (req, res) => {
    const moduleId = req.params.id;
    db.all(`SELECT * FROM module_questions WHERE module_id = ? ORDER BY question_order ASC, id ASC`, [moduleId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = (rows || []).map(q => {
            try { q.options = JSON.parse(q.options_json || '[]'); } catch(e) { q.options = []; }
            try { q.correct_answer = JSON.parse(q.correct_answer_json || 'null'); } catch(e) { q.correct_answer = q.correct_answer_json; }
            return q;
        });
        res.json(formatted);
    });
});

// POST /api/modules/:id/questions - Add a question (True/False, Multiple Choice, Matching)
app.post('/api/modules/:id/questions', (req, res) => {
    const moduleId = req.params.id;
    const { chapter_id, question_type, question_order, question_text, options, correct_answer, explanation } = req.body || {};

    if (!question_text || question_text.trim() === '') {
        return res.status(400).json({ error: 'Question text is required' });
    }

    const optionsJson = typeof options === 'object' ? JSON.stringify(options) : (options || '[]');
    const answerJson = typeof correct_answer === 'object' ? JSON.stringify(correct_answer) : JSON.stringify(correct_answer || '');

    const sql = `INSERT INTO module_questions (module_id, chapter_id, question_type, question_order, question_text, options_json, correct_answer_json, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
        moduleId, 
        chapter_id || null, 
        question_type || 'multiple_choice', 
        parseInt(question_order) || 1, 
        question_text.trim(), 
        optionsJson, 
        answerJson, 
        explanation || ''
    ], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ success: true, question_id: this.lastID, message: 'Question created successfully' });
    });
});

// PUT /api/questions/:id - Update a question
app.put('/api/questions/:id', (req, res) => {
    const questionId = req.params.id;
    const { chapter_id, question_type, question_order, question_text, options, correct_answer, explanation } = req.body || {};

    if (!question_text || question_text.trim() === '') {
        return res.status(400).json({ error: 'Question text is required' });
    }

    const optionsJson = typeof options === 'object' ? JSON.stringify(options) : (options || '[]');
    const answerJson = typeof correct_answer === 'object' ? JSON.stringify(correct_answer) : JSON.stringify(correct_answer || '');

    const sql = `UPDATE module_questions SET chapter_id = ?, question_type = ?, question_order = ?, question_text = ?, options_json = ?, correct_answer_json = ?, explanation = ? WHERE id = ?`;
    db.run(sql, [
        chapter_id || null, 
        question_type || 'multiple_choice', 
        parseInt(question_order) || 1, 
        question_text.trim(), 
        optionsJson, 
        answerJson, 
        explanation || '',
        questionId
    ], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Question updated successfully' });
    });
});

// DELETE /api/questions/:id - Delete a question
app.delete('/api/questions/:id', (req, res) => {
    const questionId = req.params.id;
    db.run(`DELETE FROM module_questions WHERE id = ?`, [questionId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Question deleted successfully' });
    });
});

// POST /api/modules/:id/submit-quiz - Grade student quiz submission
app.post('/api/modules/:id/submit-quiz', (req, res) => {
    const moduleId = req.params.id;
    const { student_id, answers } = req.body || {}; // answers is an object: { [questionId]: studentAnswer }

    db.all(`SELECT * FROM module_questions WHERE module_id = ? ORDER BY question_order ASC, id ASC`, [moduleId], (err, questions) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!questions || questions.length === 0) {
            return res.json({ success: true, score: 0, total: 0, percentage: 100, results: [] });
        }

        let correctCount = 0;
        const results = questions.map(q => {
            let correctVal;
            try { correctVal = JSON.parse(q.correct_answer_json); } catch(e) { correctVal = q.correct_answer_json; }
            
            const studentVal = answers ? answers[q.id] : undefined;
            let isCorrect = false;

            if (q.question_type === 'true_false') {
                isCorrect = String(studentVal).toLowerCase() === String(correctVal).toLowerCase();
            } else if (q.question_type === 'multiple_choice') {
                isCorrect = String(studentVal).trim() === String(correctVal).trim();
            } else if (q.question_type === 'matching') {
                // Matching pairs check: correctVal is an object { "term": "match", ... }
                if (typeof studentVal === 'object' && typeof correctVal === 'object' && studentVal && correctVal) {
                    const keys = Object.keys(correctVal);
                    const allMatch = keys.length > 0 && keys.every(k => studentVal[k] === correctVal[k]);
                    isCorrect = allMatch;
                }
            }

            if (isCorrect) correctCount++;

            return {
                question_id: q.id,
                question_text: q.question_text,
                question_type: q.question_type,
                is_correct: isCorrect,
                correct_answer: correctVal,
                student_answer: studentVal,
                explanation: q.explanation || ''
            };
        });

        const total = questions.length;
        const percentage = Math.round((correctCount / total) * 100);

        // Record student progress if student_id is provided
        if (student_id) {
            db.run(`INSERT INTO student_module_progress (student_id, module_id, tasks_completed, total_tasks, status) VALUES (?, ?, ?, ?, ?)`,
                [student_id, moduleId, correctCount, total, percentage >= 70 ? 'Completed' : 'Review Needed'],
                (progErr) => {
                    if (progErr) console.error("Error logging module progress:", progErr);
                }
            );
        }

        res.json({
            success: true,
            score: correctCount,
            total: total,
            percentage: percentage,
            passed: percentage >= 70,
            results: results
        });
    });
});

// POST /api/upload/pdf - Upload PDF file for a module or chapter
app.post('/api/upload/pdf', uploadModule.single('pdf_file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    const fileUrl = '/public/uploads/modules/' + req.file.filename;
    res.json({ success: true, file_url: fileUrl, original_name: req.file.originalname });
});

// --- SUBMISSIONS ---
// GET /api/submissions
app.get('/api/submissions', (req, res) => {
    const { module_id, student_id } = req.query;
    let sql = `SELECT s.*, st.first_name, st.last_name FROM submissions s JOIN students st ON s.student_id = st.id WHERE 1=1`;
    let params = [];
    
    if (module_id) {
        sql += ` AND s.module_id = ?`;
        params.push(module_id);
    }
    if (student_id) {
        sql += ` AND s.student_id = ?`;
        params.push(student_id);
    }
    
    sql += ` ORDER BY s.submitted_at DESC`;
    
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/submissions
app.post('/api/submissions', (req, res) => {
    const { student_id, module_id, student_answer_payload } = req.body;
    const sql = `INSERT INTO submissions (student_id, module_id, student_answer_payload) VALUES (?, ?, ?)`;
    db.run(sql, [student_id, module_id, student_answer_payload], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, submission_id: this.lastID });
    });
});

// PUT /api/submissions/:id/grade
app.put('/api/submissions/:id/grade', (req, res) => {
    const { score, teacher_feedback, grading_status } = req.body;
    const sql = `UPDATE submissions SET score = ?, teacher_feedback = ?, grading_status = ? WHERE id = ?`;
    db.run(sql, [score, teacher_feedback, grading_status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- ANNOUNCEMENTS ---
// GET /api/announcements
app.get('/api/announcements', (req, res) => {
    const { target_audience } = req.query;
    let sql = `SELECT a.*, COALESCE(t.first_name, 'Platform') as teacher_first, COALESCE(t.last_name, 'Admin') as teacher_last FROM announcements a LEFT JOIN teachers t ON a.teacher_id = t.id WHERE 1=1`;
    let params = [];
    
    if (target_audience) {
        sql += ` AND (a.target_audience = ? OR a.target_audience = 'All')`;
        params.push(target_audience);
    }
    
    sql += ` ORDER BY a.created_at DESC`;
    
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/announcements
app.post('/api/announcements', (req, res) => {
    const { teacher_id, title, message_body, target_audience } = req.body;
    const sql = `INSERT INTO announcements (teacher_id, title, message_body, target_audience) VALUES (?, ?, ?, ?)`;
    db.run(sql, [teacher_id, title, message_body, target_audience], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, announcement_id: this.lastID });
    });
});

// PUT /api/announcements/:id/view
app.put('/api/announcements/:id/view', (req, res) => {
    db.run(`UPDATE announcements SET view_count = view_count + 1 WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- PROGRESS ---
// GET /api/progress/:student_id
app.get('/api/progress/:student_id', (req, res) => {
    const sql = `
        SELECT p.*, m.title as module_title 
        FROM student_module_progress p 
        JOIN modules m ON p.module_id = m.id 
        WHERE p.student_id = ?
    `;
    db.all(sql, [req.params.student_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// PUT /api/progress/:student_id/:module_id
app.put('/api/progress/:student_id/:module_id', (req, res) => {
    const { tasks_completed, total_tasks, status } = req.body;
    
    db.get(`SELECT id FROM student_module_progress WHERE student_id = ? AND module_id = ?`, [req.params.student_id, req.params.module_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (row) {
            db.run(`UPDATE student_module_progress SET tasks_completed = ?, total_tasks = ?, status = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?`,
                [tasks_completed, total_tasks, status, row.id], function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                });
        } else {
            db.run(`INSERT INTO student_module_progress (student_id, module_id, tasks_completed, total_tasks, status) VALUES (?, ?, ?, ?, ?)`,
                [req.params.student_id, req.params.module_id, tasks_completed, total_tasks, status], function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true, progress_id: this.lastID });
                });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
