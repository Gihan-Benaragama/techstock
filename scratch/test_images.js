import fetch from 'node-fetch';

fetch('http://localhost:5001/products')
  .then(res => res.json())
  .then(data => {
    const products = data.products || data;
    products.forEach(p => {
      console.log(`Product: ${p.name}`);
      console.log(`Images: ${JSON.stringify(p.images)}`);
      console.log('---');
    });
  })
  .catch(err => console.error(err));
