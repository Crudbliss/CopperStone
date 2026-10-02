const fs = require('fs');
const path = require('path');

const videoMap = {
    'k9WUpZqS_pU': 'ukLnPbIffxE', // Ali Abdaal - How to study for exams
    'kJQP7kiw5Fk': 'FwD6i24aR34', // Thomas Frank - The Most Powerful Way to Study
    'r8dO10Jb_eE': 'DUa7FU_nhgk', // CrashCourse - How to Learn
    'yW6UqBqBfmg': 'TjPFZaMe2yw', // CrashCourse - Taking Notes
    '0k3X4c2l5kM': 'F8xSubT3nI8', // Veritasium - The 4 Things for All Learning
    'mG4KL8z5G-8': '2b3xG_YjegI'  // Barbara Oakley - Learning How to Learn
};

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [oldId, newId] of Object.entries(videoMap)) {
        content = content.split(oldId).join(newId);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated video IDs in ${filePath}`);
}

fixFile(path.join(__dirname, 'modules_data.js'));
fixFile(path.join(__dirname, 'seed_modules.js'));
