const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'pooja55@gmail.com',
      password: 'password123'
    });
    console.log('Login Success:', res.data);
  } catch (err) {
    console.error('Login Failed:', err.response ? err.response.data : err.message);
  }
}
test();
