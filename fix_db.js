const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');
db.serialize(() => {
    db.run("UPDATE classes SET course_subj_name = 'BSIT', section = 'Y2-1' WHERE course_subj_name IN ('Web Development 101', 'Software Engineering')");
    db.run("UPDATE classes SET course_subj_name = 'BSCS', section = 'Y2-2' WHERE course_subj_name = 'Data Structures'");
});
db.close();
