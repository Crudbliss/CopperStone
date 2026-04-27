const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        text TEXT NOT NULL,
        x_value REAL,
        y_value REAL,
        FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
    )`);
});

// --- API ENDPOINTS ---

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



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
