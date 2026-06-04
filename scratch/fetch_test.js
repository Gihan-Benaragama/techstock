async function test() {
  const loginResp = await fetch('http://localhost:5001/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@1234' })
  });
  const loginData = await loginResp.json();
  console.log('Login response:', loginData);
  const token = loginData.token;
  if (!token) { console.error('No token'); return; }
  const usersResp = await fetch('http://localhost:5001/api/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const usersText = await usersResp.text();
  console.log('Users raw response:', usersText);
  try {
    const users = JSON.parse(usersText);
    console.log('Parsed users:', users);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
  }
}

test();
