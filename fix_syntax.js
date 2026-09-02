const fs = require('fs');
let content = fs.readFileSync('E:\\Logimetrix 2026\\ecogrowth-mern\\server\\index.js', 'utf8');
content = content.replace('console.log(Server running on port );', 'console.log(Server running on port );');
fs.writeFileSync('E:\\Logimetrix 2026\\ecogrowth-mern\\server\\index.js', content, 'utf8');
