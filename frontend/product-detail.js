function decodeJwtPayload(token) {
  try {
    const payloadPart = token.split(".")[1];
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

// Check auth state
const token = localStorage.getItem("token");
const payload = token ? decodeJwtPayload(token) : null;

const API_BASE_URL = "http://localhost:5001"; // Base URL for backend API

const detailContainer = document.getElementById("productDetailContainer");
const cartCount = document.getElementById("cartCount");
const cartSidebar = document.getElementById("cartSidebar");
const closeCartSidebar = document.getElementById("closeCartSidebar");
const cartItemsDiv = document.getElementById("cartItems");
const cartTotalDiv = document.getElementById("cartTotal");
const cartItemCount = document.getElementById("cartItemCount");

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
updateCartCount();

// Read product ID from query parameter
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

if (!productId) {
  detailContainer.innerHTML = '<p class="error-msg">Product ID missing in URL.</p>';
} else {
  fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}`)
    .then(res => {
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    })
    .then(product => {
      renderProductDetails(product);
    })
    .catch(err => {
      detailContainer.innerHTML = `<p class="error-msg">Failed to load product: ${err.message}</p>`;
    });
}

function renderProductDetails(product) {
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ['images/default.png'];
  const primaryImage = images[0];
  
  // Format thumbnails
  const thumbnailsHtml = images.map((img, index) => {
    return `<img class="detail-thumb ${index === 0 ? 'active' : ''}" src="${img}" alt="Thumbnail ${index + 1}" onclick="switchDetailImage(this, '${img}')" />`;
  }).join('');

  const isOutOfStock = product.stock <= 0;
  const stockHtml = isOutOfStock
    ? '<span class="detail-stock out">Out of Stock</span>'
    : `<span class="detail-stock in">In Stock (${product.stock} left)</span>`;

  // Render main layout
  detailContainer.innerHTML = `
    <div class="product-detail-layout">
      <!-- Left Column: Carousel & Images -->
      <div class="detail-media-col">
        <div class="detail-main-img-wrap">
          <img id="mainDetailImage" src="${primaryImage}" alt="${product.name}" />
        </div>
        <div class="detail-thumbs-wrap">
          ${thumbnailsHtml}
        </div>
      </div>
      
      <!-- Right Column: Info & Actions -->
      <div class="detail-info-col">
        <div class="detail-category">${product.category || 'Tech'}</div>
        <h1 class="detail-title">${product.name}</h1>
        <div class="detail-sku">SKU: <span>${product.productId}</span></div>
        <div class="detail-brand-model">
          ${product.brand ? `<span>Brand: <strong>${product.brand}</strong></span>` : ''}
          ${product.model ? `<span style="margin-left: 20px;">Model: <strong>${product.model}</strong></span>` : ''}
        </div>
        
        <hr class="detail-divider" />
        
        <div class="detail-price-wrap">
          <div class="detail-price">Rs. ${product.price?.toLocaleString()}</div>
          ${product.labelledPrice > product.price ? `<div class="detail-price-labelled">Rs. ${product.labelledPrice?.toLocaleString()}</div>` : ''}
        </div>
        
        <div class="detail-stock-wrap">
          ${stockHtml}
        </div>
        
        <div class="detail-desc-title">Description</div>
        <p class="detail-desc">${product.description || 'No description available for this product.'}</p>
        
        <hr class="detail-divider" />
        
        <div class="detail-actions-wrap">
          ${isOutOfStock ? `
            <div class="detail-buttons-group">
              <button class="detail-add-btn disabled" disabled>Out of Stock</button>
            </div>
          ` : `
            <div class="qty-counter">
              <button onclick="changeQtyValue(-1)">-</button>
              <input type="text" id="detailQty" value="1" readonly />
              <button onclick="changeQtyValue(1)">+</button>
            </div>
            <div class="detail-buttons-group">
              <button class="detail-add-btn">Add to Cart</button>
              <button class="detail-buy-btn">Buy Now</button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  // Programmatically attach event listeners to prevent quote breaking in HTML templates
  const addBtn = detailContainer.querySelector('.detail-add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      addCurrentProductToCart(product.productId, product.name, product.price, primaryImage);
    });
  }

  const buyBtn = detailContainer.querySelector('.detail-buy-btn');
  if (buyBtn) {
    buyBtn.addEventListener('click', function() {
      buyCurrentProductNow(product.productId, product.name, product.price, primaryImage);
    });
  }
}

// Switch main detail image when thumbnail is clicked
window.switchDetailImage = function(element, imgUrl) {
  document.getElementById("mainDetailImage").src = imgUrl;
  document.querySelectorAll(".detail-thumb").forEach(thumb => {
    thumb.classList.remove("active");
  });
  element.classList.add("active");
};

// Increment/decrement quantity selectors
window.changeQtyValue = function(change) {
  const qtyInput = document.getElementById("detailQty");
  let val = parseInt(qtyInput.value) || 1;
  val += change;
  if (val < 1) val = 1;
  qtyInput.value = val;
};

// Add product details to Cart
window.addCurrentProductToCart = function(id, name, price, image) {
  const qtyInput = document.getElementById("detailQty");
  const qty = parseInt(qtyInput.value) || 1;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name, price, image, qty });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
  
  cartSidebar.classList.add('open');
};

// Buy Current Product Now (direct checkout)
window.buyCurrentProductNow = function(id, name, price, image) {
  const qtyInput = document.getElementById("detailQty");
  const qty = parseInt(qtyInput.value) || 1;
  
  cart = [{ id, name, price, image, qty }];
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  window.location.href = 'order-processor.html';
};


// Unified Cart Sidebar Methods
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = count;
  cartItemCount.textContent = `(${count} item${count !== 1 ? 's' : ''})`;
}

document.getElementById('cartBtn').addEventListener('click', () => {
  renderCart();
  cartSidebar.classList.add('open');
});

closeCartSidebar.addEventListener('click', () => {
  cartSidebar.classList.remove('open');
});

function renderCart() {
  if (!cart.length) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    cartTotalDiv.textContent = '';
    return;
  }
  cartItemsDiv.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
        <div class="cart-item-qty">
          <button class="cart-qty-btn" data-id="${item.id}" data-action="decrement">-</button>
          <span class="cart-qty-value">${item.qty}</span>
          <button class="cart-qty-btn" data-id="${item.id}" data-action="increment">+</button>
        </div>
      </div>
      <button class="cart-remove-btn" data-id="${item.id}" title="Remove">&#128465;</button>
    </div>
  `).join('');
  cartTotalDiv.textContent = 'Rs. ' + cart.reduce((sum, item) => sum + item.price * item.qty, 0).toLocaleString();
  
  // Remove item event
  document.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      cart = cart.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      renderCart();
    });
  });
  
  // Quantity controls
  document.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const action = this.getAttribute('data-action');
      const item = cart.find(i => i.id === id);
      if (!item) return;
      if (action === 'increment') {
        item.qty += 1;
      } else if (action === 'decrement' && item.qty > 1) {
        item.qty -= 1;
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      renderCart();
    });
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}

// Attach checkout button event
const checkoutBtn = document.querySelector('.cart-checkout-btn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', function () {
    console.log('Checkout button clicked');
    cartSidebar.classList.remove('open');
    window.location.href = 'order-processor.html';
  });
}

// Mobile Drawer logic
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileDrawer = document.getElementById("mobileDrawer");
const closeMobileDrawerBtn = document.getElementById("closeMobileDrawerBtn");
const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

if (mobileMenuBtn && mobileDrawer) {
  mobileMenuBtn.addEventListener("click", () => {
    mobileDrawer.classList.add("open");
  });
}
if (closeMobileDrawerBtn && mobileDrawer) {
  closeMobileDrawerBtn.addEventListener("click", () => {
    mobileDrawer.classList.remove("open");
  });
}
if (mobileLogoutBtn) {
  mobileLogoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}
