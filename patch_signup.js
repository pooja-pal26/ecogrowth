const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'client/src/App.jsx');
let content = fs.readFileSync(appJsxPath, 'utf8');

// Add import
content = content.replace("import Login from './pages/Login';", "import Login from './pages/Login';\nimport Signup from './pages/Signup';");

// Add route
content = content.replace('<Route path="/login" element={<Login />} />', '<Route path="/login" element={<Login />} />\n          <Route path="/signup" element={<Signup />} />');

fs.writeFileSync(appJsxPath, content);
console.log('App.jsx patched successfully with Signup route');
