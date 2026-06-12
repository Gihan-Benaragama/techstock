import fetch from "node-fetch";

async function check() {
  try {
    const res = await fetch("https://techstock-tld1.onrender.com/products");
    console.log(`Remote API Status: ${res.status}`);
    const data = await res.json();
    const products = data.products || data;
    console.log(`Found ${products.length} products on remote API.`);
    products.forEach(p => {
      console.log(`Name: ${p.name}`);
      console.log(`images:`, p.images);
      console.log('---');
    });
  } catch (err) {
    console.error("Error fetching remote products:", err);
  }
}

check();
