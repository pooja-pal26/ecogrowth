async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'pooja55@gmail.com',
        password: 'password123'
      })
    });
    const data = await res.json();
    console.log('Login Status:', res.status, data);
  } catch (err) {
    console.error('Login Failed:', err);
  }
}
test();
