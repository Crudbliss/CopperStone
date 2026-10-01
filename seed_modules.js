const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { modulesData } = require('./modules_data.js');

async function seedModules(customDb) {
    const targetDb = customDb || new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'));
    const runAsync = (sql, params = []) => new Promise((resolve, reject) => {
        targetDb.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve(this);
        });
    });

    console.log("Starting synchronous module seeding for Set A & Set B...");
    try {
        // Ensure target_weakest_quadrant column exists
        await new Promise(resolve => {
            targetDb.run(`ALTER TABLE modules ADD COLUMN target_weakest_quadrant TEXT`, () => resolve());
        });

        await runAsync(`DELETE FROM module_questions WHERE module_id IN (SELECT id FROM modules)`);
        await runAsync(`DELETE FROM module_chapters WHERE module_id IN (SELECT id FROM modules)`);
        await runAsync(`DELETE FROM modules`);
        console.log("Cleared existing modules.");

        for (let i = 0; i < modulesData.length; i++) {
            const mod = modulesData[i];
            const modRes = await runAsync(
                `INSERT INTO modules (title, description, quadrant_category, target_weakest_quadrant, difficulty, topic, estimated_time, is_published, is_archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [mod.title, mod.description, mod.quadrant_category, mod.target_weakest_quadrant || null, mod.difficulty, mod.topic, mod.estimated_time, mod.is_published, mod.is_archived]
            );
            const moduleId = modRes.lastID;
            console.log(`Inserted Module ${moduleId}: ${mod.title} (${mod.quadrant_category} -> Targets Weakness: ${mod.target_weakest_quadrant})`);

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
        console.log(`All ${modulesData.length} modules (Set A & Set B) seeded successfully!`);
    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        if (!customDb) {
            targetDb.close();
        }
    }
}

module.exports = {
    modulesData,
    seedModules
};

if (require.main === module) {
    seedModules();
}
