const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const { modulesData } = require('./modules_data.js');

function runAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

async function seed() {
    console.log("Starting synchronous module seeding into:", dbPath);
    try {
        await runAsync(`DELETE FROM module_questions`);
        await runAsync(`DELETE FROM module_chapters`);
        await runAsync(`DELETE FROM modules`);
        console.log("Cleared old modules tables.");

        for (let i = 0; i < modulesData.length; i++) {
            const mod = modulesData[i];
            const modRes = await runAsync(
                `INSERT INTO modules (title, description, quadrant_category, difficulty, topic, estimated_time, is_published, is_archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [mod.title, mod.description, mod.quadrant_category, mod.difficulty, mod.topic, mod.estimated_time, mod.is_published, mod.is_archived]
            );
            const moduleId = modRes.lastID;
            console.log(`Inserted Module ${moduleId}: ${mod.title} (${mod.quadrant_category})`);

            for (let c = 0; c < mod.chapters.length; c++) {
                const ch = mod.chapters[c];
                const blocksJson = JSON.stringify(ch.content_blocks);
                const chRes = await runAsync(
                    `INSERT INTO module_chapters (module_id, chapter_order, title, text_content, learning_objectives, examples, estimated_time, content_blocks_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [moduleId, c + 1, ch.title, '', '', '', ch.estimated_time, blocksJson]
                );
                const chapterId = chRes.lastID;
                console.log(`  -> Chapter ${chapterId}: ${ch.title}`);

                if (ch.questions && ch.questions.length > 0) {
                    for (let q = 0; q < ch.questions.length; q++) {
                        const ques = ch.questions[q];
                        await runAsync(
                            `INSERT INTO module_questions (module_id, chapter_id, question_type, question_order, question_text, options_json, correct_answer_json, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [moduleId, chapterId, ques.question_type, q + 1, ques.question_text, JSON.stringify(ques.options), JSON.stringify(ques.correct_answer), ques.explanation]
                        );
                    }
                }
            }
        }
        console.log("Module seeding finished successfully!");
    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        db.close();
    }
}

seed();
