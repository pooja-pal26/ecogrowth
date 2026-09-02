const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function seedUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecogrowth');
    console.log('Connected to MongoDB');
    
    const userSchema = new mongoose.Schema({
      name: String,
      email_id: String,
      password: String,
      role: String
    });
    
    const User = mongoose.model('User', userSchema, 'tbl_user');
    
    // Hash password 'password123'
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const newUser = new User({
      name: 'Pooja Admin',
      email_id: 'pooja55@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    await newUser.save();
    console.log('User created: pooja55@gmail.com / password123');
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

seedUser();
