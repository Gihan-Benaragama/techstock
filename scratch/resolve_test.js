import fetch from 'node-fetch';

let API_BASE = 'http://localhost:5001'; // match local dev
const resolveImageUrl = (product) => {
  let img = (product.images && product.images.length > 0) ? product.images[0] : (product.image || product.imageUrl || './images/product-placeholder.png');
  img = img.trim();
  img = img.replace(/ /g, '%20');
  if (/^https?:\/\//i.test(img)) {
    try { img = encodeURI(img); } catch(e) { console.warn('Encode fail', img, e); }
    return img;
  }
  if (/^(?:\.\/|\/)/.test(img)) {
    if (!/^\.\//.test(img)) { img = `./${img.replace(/^\//, '')}`; }
    try { img = encodeURI(img); } catch(e) { console.warn('Encode fail', img, e); }
    return img;
  }
  img = `${API_BASE}/${img.replace(/^\.?\//, '')}`;
  try { img = encodeURI(img); } catch(e) { console.warn('Encode fail', img, e); }
  if (!img) return './images/product-placeholder.png';
  return img;
};

fetch('http://localhost:5001/products')
  .then(r=>r.json())
  .then(data=>{
    const products = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
    products.slice(0,5).forEach(p=>{
      console.log('Original images array:', p.images);
      console.log('Resolved URL:', resolveImageUrl(p));
    });
  })
  .catch(err=>console.error('Fetch err', err));
