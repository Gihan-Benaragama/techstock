import fetch from 'node-fetch';
(async () => {
  try {
    const loginRes = await fetch('http://localhost:5001/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@1234' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('TOKEN', token);
    const res = await fetch('http://localhost:5001/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status', res.status);
    const text = await res.text();
    console.log('Body', text);
  } catch (err) {
    console.error('Error', err);
  }
})();
