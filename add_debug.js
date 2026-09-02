const fs = require('fs');
let content = fs.readFileSync('E:\\Logimetrix 2026\\ecogrowth-mern\\server\\controllers\\authController.js', 'utf8');

const replaceStr = `    console.log('[AUTH DEBUG] Login attempt for email:', email);
    const user = await User.findOne({ email_id: email });
    if (!user) {
      console.log('[AUTH DEBUG] User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('[AUTH DEBUG] User found:', { id: user._id, email_id: user.email_id, role: user.role });
    console.log('[AUTH DEBUG] DB Password Hash:', user.password);
    
    let isMatch = false;
    
    if (user.password.startsWith('$2') || user.password.startsWith('\`$2')) {
      console.log('[AUTH DEBUG] Checking as bcrypt hash');
      isMatch = await bcrypt.compare(password, user.password);
      console.log('[AUTH DEBUG] Bcrypt match result:', isMatch);
    } else {
      const hashedProvided = legacyHash(password);
      console.log('[AUTH DEBUG] Checking as legacy hash. Provided hashed:', hashedProvided);
      if (user.password === hashedProvided) {
        isMatch = true;
      }
      console.log('[AUTH DEBUG] Legacy match result:', isMatch);
    }`;

content = content.replace(/    const user = await User\.findOne\(\{ email_id: email \}\);[\s\S]*?if \(!isMatch\) \{/, replaceStr + '\n\n    if (!isMatch) {');
fs.writeFileSync('E:\\Logimetrix 2026\\ecogrowth-mern\\server\\controllers\\authController.js', content, 'utf8');
