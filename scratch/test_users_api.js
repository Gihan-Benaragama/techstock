import { setDefaultResultOrder, setServers } from 'dns';
setDefaultResultOrder('ipv4first');
setServers(['8.8.8.8', '8.8.4.4']);

import fetch from 'node-fetch';

async function run() {
  try {
    const loginRes = await fetch('http://localhost:5001/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@1234' })
    });
    console.log(`Login status: ${loginRes.status}`);
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login Token:', token);

    if (!token) {
      console.log('No token returned');
      return;
    }

    const res = await fetch('http://localhost:5001/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`GET /api/users Status: ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    if (contentType.includes('application/json')) {
      console.log('GET /api/users Body:', JSON.parse(text));
    } else {
      console.log(`GET /api/users Non-JSON Body length: ${text.length}`);
      console.log(text.slice(0, 200));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
