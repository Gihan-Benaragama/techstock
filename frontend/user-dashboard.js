// user-dashboard.js
// Handles only product list rendering, page fetching, and pagination for user-dashboard.html.
// Shared header/cart/profile/search logic is managed by header.js.

// Resolve API base: prefer local backend when developing locally
// Resolve API base: prefer local backend when developing locally
function getApiBaseUrl() {
  let base = "https://techstock-kxtz.onrender.com";
  if (window.location) {
    const hn = window.location.hostname;
    const isLocal = hn === 'localhost' ||
      hn === '127.0.0.1' ||
      /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hn) ||
      hn.endsWith('.local') ||
      !hn ||
      window.location.protocol === 'file:';
    if (isLocal) {
      const host = (window.location.protocol === 'file:' || !hn) ? 'localhost' : hn;
      base = `http://${host}:5001`;
    }
  }
  return base;
}


let currentPage = 1;
const pageSize = 12; // products per page

// Determine initial page from URL
function getPageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const p = parseInt(params.get('page') || '1', 10);
  return isNaN(p) || p < 1 ? 1 : p;
}

function fetchPage(page) {
  const url = `${getApiBaseUrl()}/products?page=${page}&limit=${pageSize}`;
  console.log('Fetching products from', url);
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(url, { headers })
    .then(r => {
      if (!r.ok) {
        // If localhost fails, try remote URL
        if (url.includes('localhost')) {
          const remoteUrl = `https://techstock-kxtz.onrender.com/products?page=${page}&limit=${pageSize}`;
          console.warn('Primary fetch failed, trying remote:', remoteUrl);
          return fetch(remoteUrl, { headers }).then(r2 => {
            if (!r2.ok) throw new Error(`Remote fetch failed: ${r2.status}`);
            return r2.json();
          });
        }
        throw new Error(`Fetch failed: ${r.status}`);
      }
      return r.json();
    })
    .catch(err => {
      console.error('Products fetch error', err);
      return null;
    });
}

function renderServerProducts(products, page, totalPages, total) {
  currentPage = page;
  const productsList = document.getElementById('productsList');
  if (!productsList) return;

  const html = products.map(product => {
    let imageUrl = (Array.isArray(product.images) && product.images.length > 0) ? product.images[0] : 'images/default.png';
    if (!/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith('/')) imageUrl = `./${imageUrl}`;
    let image2Url = (Array.isArray(product.images) && product.images.length > 1) ? product.images[1] : imageUrl;
    if (!/^https?:\/\//i.test(image2Url) && !image2Url.startsWith('/')) image2Url = `./${image2Url}`;
    return `
      <div class="product-card">
        <div class="product-image-container" onclick="window.location.href='product-detail.html?id=${encodeURIComponent(product.productId)}'" style="cursor:pointer;">
          <img class="product-image-hover primary" src="${imageUrl}" alt="${product.name || 'Product'}">
          <img class="product-image-hover secondary" src="${image2Url}" alt="${product.name || 'Product'}">
        </div>
        <div class="product-name" onclick="window.location.href='product-detail.html?id=${encodeURIComponent(product.productId)}'" style="cursor:pointer;">${product.name || ''}</div>
        <div class="product-price">Rs. ${product.price?.toLocaleString() ?? ''}</div>
        <div class="product-desc">${product.description ? product.description : ''}</div>
        <button class="add-cart-btn" data-id="${product.productId}" data-name="${product.name}" data-price="${product.price}" data-image="${imageUrl}">Add to Cart</button>
      </div>
    `;
  }).join('');
  productsList.innerHTML = html;

  // attach cart handlers
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const id = this.getAttribute('data-id');
      const name = this.getAttribute('data-name');
      const price = parseFloat(this.getAttribute('data-price'));
      const image = this.getAttribute('data-image');
      if (window.addToCart) {
        window.addToCart({ id, name, price, image });
      }
    });
  });

  renderCompactPagination(page, totalPages);

  // Staggered animation
  const cards = productsList.querySelectorAll('.product-card');
  cards.forEach((card, idx) => {
    card.classList.add('animate-in');
    card.style.animationDelay = `${idx * 70}ms`;
  });

  // trigger nav animation
  const nav = document.querySelector('.dashboard-nav');
  if (nav && !nav.classList.contains('animate-in')) {
    setTimeout(() => nav.classList.add('animate-in'), 80);
  }

  // update URL without reloading
  const params = new URLSearchParams(window.location.search);
  params.set('page', page);
  const newUrl = window.location.pathname + '?' + params.toString();
  window.history.replaceState({}, '', newUrl);
}

function renderCompactPagination(current, totalPages) {
  const paginationEl = document.getElementById('pagination');
  if (!paginationEl) return;
  const pages = [];
  pages.push(`<button class="page-btn" data-action="prev" ${current===1? 'disabled' : ''}>Previous</button>`);

  const delta = 2;
  const range = [];
  for (let i = Math.max(1, current - delta); i <= Math.min(totalPages, current + delta); i++) range.push(i);

  if (range[0] > 1) {
    pages.push(`<button class="page-btn ${1===current? 'active' : ''}" data-page="1">1</button>`);
    if (range[0] > 2) pages.push(`<span class="ellipsis">&hellip;</span>`);
  }

  range.forEach(i => pages.push(`<button class="page-btn ${i===current? 'active' : ''}" data-page="${i}">${i}</button>`));

  if (range[range.length-1] < totalPages) {
    if (range[range.length-1] < totalPages - 1) pages.push(`<span class="ellipsis">&hellip;</span>`);
    pages.push(`<button class="page-btn ${totalPages===current? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`);
  }

  pages.push(`<button class="page-btn" data-action="next" ${current===totalPages? 'disabled' : ''}>Next</button>`);
  paginationEl.innerHTML = pages.join('');
}

// pagination click handling (delegated)
function initPaginationListener() {
  const paginationEl = document.getElementById('pagination');
  if (paginationEl) {
    paginationEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button.page-btn');
      if (!btn) return;
      if (btn.dataset.action === 'prev') {
        if (currentPage > 1) {
          fetchPage(currentPage - 1).then(data => {
            if (data) renderServerProducts(data.products, data.page, data.totalPages, data.total);
          });
        }
        return;
      }
      if (btn.dataset.action === 'next') {
        fetchPage(currentPage + 1).then(data => {
          if (data) renderServerProducts(data.products, data.page, data.totalPages, data.total);
        });
        return;
      }
      const page = parseInt(btn.dataset.page, 10);
      if (!isNaN(page)) {
        fetchPage(page).then(data => {
          if (data) renderServerProducts(data.products, data.page, data.totalPages, data.total);
        });
      }
    });
  }
}

function initDashboard() {
  currentPage = getPageFromUrl();
  const productsList = document.getElementById('productsList');
  if (productsList) {
    productsList.innerHTML = '<p style="padding: 20px; text-align: center; color: #64748b;">Loading products...</p>';
    fetchPage(currentPage).then(data => {
      if (!data || !Array.isArray(data.products) || data.products.length === 0) {
        productsList.innerHTML = '<p style="padding: 20px; text-align: center; color: #64748b;">No products found.</p>';
        const paginationEl = document.getElementById('pagination');
        if (paginationEl) paginationEl.innerHTML = '';
        return;
      }
      renderServerProducts(data.products, data.page, data.totalPages, data.total);
      if (window.updateCartCount) {
        window.updateCartCount();
      }
    });
  }
  initPaginationListener();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
