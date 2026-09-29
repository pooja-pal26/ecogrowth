const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@logimetrix.co.in',
      password: 'cropnet@123'
    });
    console.log('Login Success:', res.data);
  } catch (err) {
    console.error('Login Failed:', err.response ? err.response.data : err.message);
  }
}
test();
