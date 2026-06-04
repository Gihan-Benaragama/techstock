import { setDefaultResultOrder, setServers } from 'dns';
setDefaultResultOrder('ipv4first');
setServers(['8.8.8.8', '8.8.4.4']);

import fetch from 'node-fetch';

async function test(label, headers) {
  try {
    const res = await fetch('http://localhost:5001/products?page=1&limit=12', { headers });
    console.log(`[${label}] Status: ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    if (contentType.includes('application/json')) {
      console.log(`[${label}] Body:`, JSON.parse(text));
    } else {
      console.log(`[${label}] Non-JSON Body length: ${text.length}`);
    }
  } catch (err) {
    console.error(`[${label}] Error:`, err.message);
  }
}

async function run() {
  await test('No Authorization Header', {});
  await test('Auth: Bearer null', { Authorization: 'Bearer null' });
  await test('Auth: Bearer undefined', { Authorization: 'Bearer undefined' });
  await test('Auth: Bearer invalid_token', { Authorization: 'Bearer invalid_token' });
  
  // Test POST protection
  try {
    const res = await fetch('http://localhost:5001/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_token'
      },
      body: JSON.stringify({ productId: 'TEST', name: 'Test Product' })
    });
    console.log(`[POST with invalid_token] Status: ${res.status}`);
    const text = await res.text();
    console.log(`[POST with invalid_token] Body:`, text);
  } catch (err) {
    console.error(`[POST] Error:`, err.message);
  }
}

run();
