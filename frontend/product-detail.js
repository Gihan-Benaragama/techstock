// ── product-detail.js ──────────────────────────────────────────────────────
// NOTE: header.js is loaded BEFORE this file and handles:
//   - token / payload / isLoggedIn
//   - cart, updateCartCount, renderCart, addToCart
//   - cart sidebar open/close
//   - mobile drawer, search, profile dropdown, logout
// This file ONLY handles fetching & rendering the product detail section.

document.addEventListener('DOMContentLoaded', function () {

  // ── Resolve API base URL ─────────────────────────────────────────────────
  let API_BASE_URL = "https://techstock-tld1.onrender.com";
  if (window.location) {
    const hn = window.location.hostname;
    const isLocal =
      hn === 'localhost' ||
      hn === '127.0.0.1' ||
      /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hn) ||
      hn.endsWith('.local') ||
      !hn ||
      window.location.protocol === 'file:';
    if (isLocal) {
      const host = (window.location.protocol === 'file:' || !hn) ? 'localhost' : hn;
      API_BASE_URL = `http://${host}:5001`;
    }
  }

  // ── Get the container ────────────────────────────────────────────────────
  const detailContainer = document.getElementById('productDetailContainer');
  if (!detailContainer) return;

  // ── Read product ID from query param ─────────────────────────────────────
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const storedToken = localStorage.getItem("token");

  if (!productId) {
    detailContainer.innerHTML = '<p class="error-msg">Product ID missing in URL.</p>';
    return;
  }

  // ── Fetch product ─────────────────────────────────────────────────────────
  fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}`, {
    headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {}
  })
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

  // ── Render product details ────────────────────────────────────────────────
  function renderProductDetails(product) {
    // Ensure we have a valid images array
    const images =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : ['images/product-placeholder.png'];

    // Determine primary image — guard against missing or un-interpolated '${…}' strings
    let primaryImage = images[0];
    if (!primaryImage || primaryImage.includes('${')) {
      primaryImage = 'images/product-placeholder.png';
    } else {
      primaryImage = encodeURI(primaryImage);
    }

    // Build thumbnail HTML
    const thumbnailsHtml = images
      .map((img, index) => {
        const imgUrl =
          !img || img.includes('${')
            ? 'images/product-placeholder.png'
            : encodeURI(img);
        return `<img
          class="detail-thumb ${index === 0 ? 'active' : ''}"
          src="${imgUrl}"
          alt="Thumbnail ${index + 1}"
          onclick="switchDetailImage(this, '${imgUrl}')"
          onerror="this.src='images/product-placeholder.png'"
        />`;
      })
      .join('');

    const isOutOfStock = product.stock <= 0;
    const stockHtml = isOutOfStock
      ? '<span class="detail-stock out">Out of Stock</span>'
      : `<span class="detail-stock in">In Stock (${product.stock} left)</span>`;

    detailContainer.innerHTML = `
      <div class="product-detail-layout">
        <!-- Left: Images -->
        <div class="detail-media-col">
          <div class="detail-main-img-wrap">
            <img
              id="mainDetailImage"
              src="${primaryImage}"
              alt="${product.name}"
              onerror="this.onerror=null; this.src='images/product-placeholder.png';"
            />
          </div>
          <div class="detail-thumbs-wrap">${thumbnailsHtml}</div>
        </div>

        <!-- Right: Info -->
        <div class="detail-info-col">
          <div class="detail-category">${product.category || 'Tech'}</div>
          <h1 class="detail-title">${product.name}</h1>
          <div class="detail-sku">SKU: <span>${product.productId}</span></div>
          <div class="detail-brand-model">
            ${product.brand ? `<span>Brand: <strong>${product.brand}</strong></span>` : ''}
            ${product.model ? `<span style="margin-left:20px;">Model: <strong>${product.model}</strong></span>` : ''}
          </div>

          <hr class="detail-divider" />

          <div class="detail-price-wrap">
            <div class="detail-price">Rs. ${product.price?.toLocaleString()}</div>
            ${product.labelledPrice > product.price
        ? `<div class="detail-price-labelled">Rs. ${product.labelledPrice?.toLocaleString()}</div>`
        : ''}
          </div>

          <div class="detail-stock-wrap">${stockHtml}</div>

          <div class="detail-desc-title">Description</div>
          <p class="detail-desc">${product.description || 'No description available.'}</p>

          <hr class="detail-divider" />

          <div class="detail-actions-wrap">
            ${isOutOfStock
        ? `<div class="detail-buttons-group">
                   <button class="detail-add-btn disabled" disabled>Out of Stock</button>
                 </div>`
        : `<div class="qty-counter">
                   <button onclick="changeQtyValue(-1)">-</button>
                   <input type="text" id="detailQty" value="1" readonly />
                   <button onclick="changeQtyValue(1)">+</button>
                 </div>
                 <div class="detail-buttons-group">
                   <button class="detail-add-btn" id="detailAddBtn">Add to Cart</button>
                   <button class="detail-buy-btn" id="detailBuyBtn">Buy Now</button>
                 </div>`
      }
          </div>
        </div>
      </div>
    `;

    // ── Wire up Add to Cart ──────────────────────────────────────────────────
    const addBtn = document.getElementById('detailAddBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const qty = parseInt(document.getElementById('detailQty').value) || 1;
        // Use header.js addToCart if available, otherwise fall back
        if (typeof window.addToCart === 'function') {
          for (let i = 0; i < qty; i++) {
            window.addToCart({ id: product.productId, name: product.name, price: product.price, image: primaryImage });
          }
        }
      });
    }

    // ── Wire up Buy Now ──────────────────────────────────────────────────────
    const buyBtn = document.getElementById('detailBuyBtn');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        const qty = parseInt(document.getElementById('detailQty').value) || 1;
        const buyCart = [{ id: product.productId, name: product.name, price: product.price, image: primaryImage, qty }];
        localStorage.setItem('cart', JSON.stringify(buyCart));
        window.location.href = 'order-processor.html';
      });
    }
  }

  // ── Thumbnail switcher ────────────────────────────────────────────────────
  window.switchDetailImage = function (element, imgUrl) {
    const main = document.getElementById("mainDetailImage");
    if (main) main.src = imgUrl;
    document.querySelectorAll(".detail-thumb").forEach(t => t.classList.remove("active"));
    element.classList.add("active");
  };

  // ── Qty counter ───────────────────────────────────────────────────────────
  window.changeQtyValue = function (change) {
    const qtyInput = document.getElementById("detailQty");
    if (!qtyInput) return;
    let val = parseInt(qtyInput.value) || 1;
    val = Math.max(1, val + change);
    qtyInput.value = val;
  };

}); // end DOMContentLoaded
