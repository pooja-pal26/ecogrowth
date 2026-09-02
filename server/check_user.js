const mongoose = require('mongoose');

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecogrowth');
    console.log('Connected to MongoDB');
    
    // Define schema matching the one in User.js
    const userSchema = new mongoose.Schema({
      email_id: String,
      password: String
    });
    
    const User = mongoose.model('User', userSchema, 'tbl_user');
    
    const user = await User.findOne({ email_id: 'pooja55@gmail.com' });
    if (user) {
      console.log('User found:', user);
    } else {
      console.log('User not found in MongoDB');
      
      const allUsers = await User.find({});
      console.log('Total users in DB:', allUsers.length);
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

checkUser();
