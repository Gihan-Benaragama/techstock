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
const token = localStorage.getItem("token");
const payload = token ? decodeJwtPayload(token) : null;
const API_BASE_URL = "https://techstock-kxtz.onrender.com";
const isLoggedIn = !!payload;

// Show login button or profile menu based on auth state
const headerLoginBtn = document.getElementById('headerLoginBtn');
const profileMenuContainer = document.getElementById('profileMenuContainer');
const mobileLoginBtn = document.getElementById('mobileLoginBtn');
const mobileProfSection = document.querySelector('.mobile-profile-section');

if (isLoggedIn) {
  if (headerLoginBtn) headerLoginBtn.style.display = 'none';
  if (profileMenuContainer) profileMenuContainer.style.display = 'block';
  if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
  const mobileLogoutBtnEl = document.getElementById('mobileLogoutBtn');
  if (mobileLogoutBtnEl) mobileLogoutBtnEl.style.display = 'block';
  if (mobileProfSection) mobileProfSection.style.display = 'flex';
} else {
  if (headerLoginBtn) headerLoginBtn.style.display = 'none';
  if (profileMenuContainer) profileMenuContainer.style.display = 'block';
  const profileAvatarEl = document.getElementById("profileAvatar");
  if (profileAvatarEl) {
    profileAvatarEl.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z'/></svg>";
  }
  if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
  const mobileLogoutBtnEl = document.getElementById('mobileLogoutBtn');
  if (mobileLogoutBtnEl) mobileLogoutBtnEl.style.display = 'none';
  if (mobileProfSection) mobileProfSection.style.display = 'none';
}
const productsList = document.getElementById('productsList');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const closeCartSidebar = document.getElementById('closeCartSidebar');
const cartItemsDiv = document.getElementById('cartItems');
const cartTotalDiv = document.getElementById('cartTotal');
const cartItemCount = document.getElementById('cartItemCount');

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let allProducts = [];

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileSearchResults = document.getElementById('mobileSearchResults');

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

updateCartCount();

productsList.innerHTML = '<p>Loading products...</p>';

fetch(`${API_BASE_URL}/products`)
  .then(res => res.json())
  .then(data => {
    if (Array.isArray(data) && data.length > 0) {
      allProducts = data;
      const html = data.map(product => {
        let imageUrl = (Array.isArray(product.images) && product.images.length > 0) ? product.images[0] : 'images/default.png';
        if (!/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith("/")) {
          imageUrl = `./${imageUrl}`;
        }
        let image2Url = (Array.isArray(product.images) && product.images.length > 1) ? product.images[1] : imageUrl;
        if (!/^https?:\/\//i.test(image2Url) && !image2Url.startsWith("/")) {
          image2Url = `./${image2Url}`;
        }
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
      // Add event listeners for cart buttons
      document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          const id = this.getAttribute('data-id');
          const name = this.getAttribute('data-name');
          const price = parseFloat(this.getAttribute('data-price'));
          const image = this.getAttribute('data-image');

          addToCart({ id, name, price, image });
        });
      });
    } else {
      productsList.innerHTML = '<p>No products found.</p>';
    }
    updateCartCount();
  });

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = count;
  cartItemCount.textContent = `(${count} item${count !== 1 ? 's' : ''})`;
}

cartBtn.addEventListener('click', () => {
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
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      cart = cart.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      renderCart();
    });
  });
  // Quantity controls
  document.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', function () {
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

// Attach checkout button event
const checkoutBtn = document.querySelector('.cart-checkout-btn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', function () {
    console.log('Checkout button clicked');
    cartSidebar.classList.remove('open');
    window.location.href = 'order-processor.html';
  });
}

// --- User Profile Dropdown and Info Display ---
if (payload) {
  const userFullName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'User Profile';
  const userEmail = payload.email || '';
  const userAvatar = payload.Image || payload.image || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z'/></svg>";

  // Populate desktop dropdown details
  const profileNameEl = document.getElementById("profileName");
  const profileEmailEl = document.getElementById("profileEmail");
  const profileAvatarEl = document.getElementById("profileAvatar");
  const dropdownAvatarEl = document.getElementById("dropdownAvatar");

  if (profileNameEl) profileNameEl.textContent = userFullName;
  if (profileEmailEl) profileEmailEl.textContent = userEmail;
  if (profileAvatarEl) profileAvatarEl.src = userAvatar;
  if (dropdownAvatarEl) dropdownAvatarEl.src = userAvatar;

  // Populate mobile drawer details
  const mobileNameEl = document.getElementById("mobileName");
  const mobileEmailEl = document.getElementById("mobileEmail");
  const mobileAvatarEl = document.getElementById("mobileAvatar");

  if (mobileNameEl) mobileNameEl.textContent = userFullName;
  if (mobileEmailEl) mobileEmailEl.textContent = userEmail;
  if (mobileAvatarEl) mobileAvatarEl.src = userAvatar;
}

// Profile dropdown toggle logic
const profileBtn = document.getElementById("profileBtn");
const profileDropdown = document.getElementById("profileDropdown");

if (profileBtn) {
  profileBtn.title = isLoggedIn ? "User Profile" : "Login";
}

if (profileBtn && profileDropdown) {
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      window.location.href = "login.html";
      return;
    }
    const isDisplayed = profileDropdown.style.display === "flex";
    profileDropdown.style.display = isDisplayed ? "none" : "flex";
  });

  // Close profile dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
      profileDropdown.style.display = "none";
    }
  });
}

// Logout handlers
const profileLogoutBtn = document.getElementById("profileLogoutBtn");
if (profileLogoutBtn) {
  profileLogoutBtn.addEventListener("click", () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
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
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  });
}

// --- Search Results Rendering & Logic ---
function renderSearchResultsCards(productArray, container) {
  if (!Array.isArray(productArray) || productArray.length === 0) {
    container.innerHTML = '<p style="color: #888; padding: 12px; font-size: 0.9rem; text-align: center;">No products found.</p>';
    return;
  }
  const html = productArray.map(product => {
    let imageUrl = (Array.isArray(product.images) && product.images.length > 0) ? product.images[0] : 'images/default.png';
    if (!/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith("/")) {
      imageUrl = `./${imageUrl}`;
    }
    return `
      <div class="product-card">
        <div onclick="window.location.href='product-detail.html?id=${encodeURIComponent(product.productId)}'" style="cursor:pointer; width: 100%;">
          <img src="${imageUrl}" alt="${product.name || 'Product'}">
        </div>
        <div class="product-name" onclick="window.location.href='product-detail.html?id=${encodeURIComponent(product.productId)}'" style="cursor:pointer;">${product.name || ''}</div>
        <div class="product-price">Rs. ${product.price?.toLocaleString() ?? ''}</div>
        <button class="add-cart-btn" data-id="${product.productId}" data-name="${product.name}" data-price="${product.price}" data-image="${imageUrl}">Add to Cart</button>
      </div>
    `;
  }).join('');
  container.innerHTML = html;

  // Add event listeners for add-to-cart inside dropdown results
  container.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const id = this.getAttribute('data-id');
      const name = this.getAttribute('data-name');
      const price = parseFloat(this.getAttribute('data-price'));
      const image = this.getAttribute('data-image');

      addToCart({ id, name, price, image });
    });
  });
}

function handleSearchInput(inputEl, resultsEl) {
  if (!inputEl || !resultsEl) return;
  inputEl.addEventListener('input', () => {
    const query = inputEl.value.trim().toLowerCase();
    if (!query) {
      resultsEl.style.display = 'none';
      resultsEl.innerHTML = '';
      return;
    }
    const filtered = allProducts.filter(p =>
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
    renderSearchResultsCards(filtered, resultsEl);
    resultsEl.style.display = 'grid';
  });
}

// Bind search input for desktop and mobile drawer
handleSearchInput(searchInput, searchResults);
handleSearchInput(mobileSearchInput, mobileSearchResults);

// Close search dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (searchInput && searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
    searchResults.style.display = 'none';
  }
  if (mobileSearchInput && mobileSearchResults && !mobileSearchInput.contains(e.target) && !mobileSearchResults.contains(e.target)) {
    mobileSearchResults.style.display = 'none';
  }
});

