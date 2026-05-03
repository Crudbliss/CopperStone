const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

const questions = [
    {
        title: "When tackling a new complex project, how do you prefer to work?",
        answers: [
            { text: "I prefer working alone with a clear set of instructions from the teacher.", x: -1, y: 1 },
            { text: "I prefer working alone, figuring out my own unique approach as I go.", x: 1, y: 1 },
            { text: "I prefer working in a group where the teacher assigns us specific roles.", x: -1, y: -1 },
            { text: "I prefer working in a group where we collaboratively brainstorm our own approach.", x: 1, y: -1 }
        ]
    },
    {
        title: "How do you prefer to receive feedback on your work?",
        answers: [
            { text: "Direct, private feedback from the instructor grading against a strict rubric.", x: -1, y: 1 },
            { text: "Private feedback from the instructor focusing on my personal growth and creativity.", x: 1, y: 1 },
            { text: "Public feedback in front of the class based on standard academic criteria.", x: -1, y: -1 },
            { text: "Peer-review sessions where the whole class critiques each other openly.", x: 1, y: -1 }
        ]
    },
    {
        title: "What type of study environment makes you most productive?",
        answers: [
            { text: "A quiet room by myself following a strict study schedule.", x: -1, y: 1 },
            { text: "A quiet room by myself where I can study whatever I feel like at that moment.", x: 1, y: 1 },
            { text: "A study group led by a tutor or a strict study guide.", x: -1, y: -1 },
            { text: "A casual study group where we freely discuss topics as they come up.", x: 1, y: -1 }
        ]
    },
    {
        title: "If you run into a difficult problem, what is your first step?",
        answers: [
            { text: "Look at the textbook or ask the instructor for the exact formula/rule.", x: -1, y: 1 },
            { text: "Research online and experiment with different methods on my own.", x: 1, y: 1 },
            { text: "Ask my assigned group members what the instructor told us to do.", x: -1, y: -1 },
            { text: "Post in a class forum to see how others are creatively solving it.", x: 1, y: -1 }
        ]
    },
    {
        title: "How do you measure your own success in a course?",
        answers: [
            { text: "By achieving a high grade based on the syllabus standards.", x: -1, y: 1 },
            { text: "By feeling that I personally mastered a new, challenging skill.", x: 1, y: 1 },
            { text: "By my team getting top marks on the collaborative final project.", x: -1, y: -1 },
            { text: "By the positive impact and recognition my team's project had on the community.", x: 1, y: -1 }
        ]
    }
];

db.serialize(() => {
    db.run("DELETE FROM student_responses");
    db.run("DELETE FROM answers");
    db.run("DELETE FROM questions");

    const stmtQ = db.prepare("INSERT INTO questions (title) VALUES (?)");
    const stmtA = db.prepare("INSERT INTO answers (question_id, text, x_value, y_value) VALUES (?, ?, ?, ?)");

    let completedQuestions = 0;

    questions.forEach(q => {
        stmtQ.run([q.title], function(err) {
            if (err) throw err;
            const qId = this.lastID;
            
            q.answers.forEach(a => {
                stmtA.run([qId, a.text, a.x, a.y]);
            });

            completedQuestions++;
            if (completedQuestions === questions.length) {
                stmtQ.finalize();
                stmtA.finalize();
                console.log("Answers seeded successfully!");
                db.close();
            }
        });
    });
});
