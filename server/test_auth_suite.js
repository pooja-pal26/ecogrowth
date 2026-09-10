require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'pooja55@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('ERROR: ADMIN_PASSWORD not configured in server/.env');
  process.exit(1);
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
          cookies: res.headers['set-cookie'] || []
        });
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING AUTHENTICATION VERIFICATION SUITE ---');

  // Connect to DB temporarily to get or set a test deactivated user
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecogrowth');

  // 1. Check an inactive user
  let inactiveUser = await User.findOne({ status: 0, is_deleted: 0 });
  if (!inactiveUser) {
    inactiveUser = await User.create({
      name: 'Inactive Test User',
      email_id: 'inactive_test@example.com',
      password: 'testpassword123',
      status: 0,
      is_deleted: 0,
      role: 'user'
    });
  }

  // 2. Check a deleted user
  let deletedUser = await User.findOne({ is_deleted: 1 });
  if (!deletedUser) {
    deletedUser = await User.create({
      name: 'Deleted Test User',
      email_id: 'deleted_test@example.com',
      password: 'testpassword123',
      status: 1,
      is_deleted: 1,
      role: 'user'
    });
  }

  let cookieHeader = '';

  // TEST 1: Valid Admin Login
  console.log('\n[TEST 1] Admin Login with valid credentials...');
  const res1 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  console.log('Status:', res1.statusCode);
  console.log('Success flag:', res1.data.success);
  console.log('User role:', res1.data.user?.role);
  console.log('Password excluded from response:', res1.data.user?.password === undefined);
  const authCookie = res1.cookies.find(c => c.startsWith('token='));
  console.log('HTTP-Only Cookie received:', !!authCookie);
  if (authCookie) {
    cookieHeader = authCookie.split(';')[0];
  }

  if (res1.statusCode !== 200 || !res1.data.success || res1.data.user?.password) {
    console.error('FAILED TEST 1');
  } else {
    console.log('PASSED TEST 1');
  }

  // TEST 2: Invalid password
  console.log('\n[TEST 2] Login with incorrect password...');
  const res2 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: ADMIN_EMAIL, password: 'WrongPassword999!' });

  console.log('Status:', res2.statusCode, '(Expected 401)');
  console.log('Error message:', res2.data.message);
  if (res2.statusCode === 401) {
    console.log('PASSED TEST 2');
  } else {
    console.error('FAILED TEST 2');
  }

  // TEST 3: Deactivated account
  console.log('\n[TEST 3] Login with deactivated account (status = 0)...');
  const res3 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: inactiveUser.email_id, password: 'anypassword' });

  console.log('Status:', res3.statusCode, '(Expected 403)');
  console.log('Error message:', res3.data.message);
  if (res3.statusCode === 403) {
    console.log('PASSED TEST 3');
  } else {
    console.error('FAILED TEST 3');
  }

  // TEST 4: Deleted account
  console.log('\n[TEST 4] Login with deleted account (is_deleted = 1)...');
  const res4 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: deletedUser.email_id, password: 'anypassword' });

  console.log('Status:', res4.statusCode, '(Expected 403)');
  console.log('Error message:', res4.data.message);
  if (res4.statusCode === 403) {
    console.log('PASSED TEST 4');
  } else {
    console.error('FAILED TEST 4');
  }

  // TEST 5: Access protected /api/auth/me with Cookie
  console.log('\n[TEST 5] Access /api/auth/me with auth cookie...');
  const res5 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Cookie': cookieHeader }
  });

  console.log('Status:', res5.statusCode, '(Expected 200)');
  console.log('Identified User Email:', res5.data.user?.email_id);
  if (res5.statusCode === 200 && res5.data.user?.email_id === ADMIN_EMAIL) {
    console.log('PASSED TEST 5');
  } else {
    console.error('FAILED TEST 5');
  }

  // TEST 6: Access protected /api/auth/me without Cookie or Token
  console.log('\n[TEST 6] Access /api/auth/me without auth...');
  const res6 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET'
  });

  console.log('Status:', res6.statusCode, '(Expected 401)');
  if (res6.statusCode === 401) {
    console.log('PASSED TEST 6');
  } else {
    console.error('FAILED TEST 6');
  }

  // TEST 7: Logout
  console.log('\n[TEST 7] Call /api/auth/logout...');
  const res7 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/logout',
    method: 'GET',
    headers: { 'Cookie': cookieHeader }
  });

  console.log('Status:', res7.statusCode, '(Expected 200)');
  console.log('Set-Cookie cleared token:', res7.cookies.some(c => c.includes('token=none') || c.includes('token=;')));
  if (res7.statusCode === 200) {
    console.log('PASSED TEST 7');
  } else {
    console.error('FAILED TEST 7');
  }

  // Cleanup test accounts created if any
  await User.deleteOne({ email_id: 'inactive_test@example.com' });
  await User.deleteOne({ email_id: 'deleted_test@example.com' });

  await mongoose.disconnect();
  console.log('\n--- ALL AUTOMATED TESTS COMPLETED ---');
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
