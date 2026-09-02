const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf16le');
    if (!content.includes('import ') && !content.includes('const ') && !content.includes('module.')) {
      content = fs.readFileSync(filePath, 'utf8');
    } else {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
    }
    
    // Also read as utf8 to see if it's already utf8
    let testUtf8 = fs.readFileSync(filePath, 'utf8');
    if (testUtf8.includes('import ') || testUtf8.includes('const ') || testUtf8.includes('module.')) {
       content = testUtf8; // It was already utf8
    }

    if (filePath.endsWith('server\\\\index.js') || filePath.endsWith('server/index.js')) {
      content = content.replace('console.log(Server running on port );', 'console.log(Server running on port );');
      content = content.replace('console.log(Server running on port $PORT);', 'console.log(Server running on port );');
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
  } catch (err) {
    console.error('Error fixing ' + filePath, err);
  }
}

const files = [
  'server/index.js',
  'server/models/User.js',
  'server/controllers/authController.js',
  'server/routes/authRoutes.js',
  'server/middleware/authMiddleware.js',
  'client/src/context/AuthContext.jsx',
  'client/src/components/ProtectedRoute.jsx',
  'client/src/pages/Login.jsx',
  'client/src/pages/Dashboard.jsx',
  'client/src/App.jsx',
  'client/src/main.jsx'
];

files.forEach(f => {
  fixFile(path.join(__dirname, f));
});
