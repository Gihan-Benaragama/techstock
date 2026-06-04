function decodeJwtPayload(token) {
  try {
    const payloadPart = token.split(".")[1];
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch (error) {
    return null;
  }
}


document.addEventListener("DOMContentLoaded", function () {
  const adminNameEl = document.getElementById("adminName");
  const adminEmailEl = document.getElementById("adminEmail");
  const tokenStateEl = document.getElementById("tokenState");
  const logoutBtn = document.getElementById("logoutBtn");
  const createProductForm = document.getElementById("createProductForm");
  const openAddProductBtn = document.getElementById("openAddProductBtn");
  const closeAddProductBtn = document.getElementById("closeAddProductBtn");
  const addProductPanel = document.getElementById("addProductPanel");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const actionStatusEl = document.getElementById("actionStatus");
  const productsTableBody = document.getElementById("productsTableBody");
  const menuButtons = document.querySelectorAll(".menu-btn");
  const contentSections = document.querySelectorAll(".content-section");
  const saveProductBtn = document.getElementById("saveProductBtn");

  const token = localStorage.getItem("token");
  const payload = token ? decodeJwtPayload(token) : null;
  const API_BASE_URL = "http://localhost:5001";

  function setActionStatus(message, type = "") {
    actionStatusEl.textContent = message;
    actionStatusEl.className = `action-status ${type}`.trim();
  }

  function toArray(value) {
    if (!value) {
      return undefined;
    }
    const parts = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return parts.length ? parts : undefined;
  }


  function toOptionalNumber(value) {
    if (value === "" || value == null) {
      return undefined;
    }
    return Number(value);
  }

  const imageUrlsContainer = document.getElementById("imageUrlsContainer");
  const addImageUrlBtn = document.getElementById("addImageUrlBtn");

  function addImageInputRow(value = "", isFirst = false) {
    if (!imageUrlsContainer) return;
    
    const row = document.createElement("div");
    row.className = "image-input-row";
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.alignItems = "center";
    row.style.width = "100%";

    const input = document.createElement("input");
    input.type = "url";
    input.className = "product-image-input";
    input.placeholder = isFirst ? "Primary Image URL (required)" : "Additional Image URL";
    input.value = value;
    input.style.flex = "1";
    if (isFirst) {
      input.required = true;
    }

    row.appendChild(input);

    if (!isFirst) {
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "mini-btn del";
      deleteBtn.textContent = "Remove";
      deleteBtn.style.padding = "8px 12px";
      deleteBtn.style.flexShrink = "0";
      deleteBtn.addEventListener("click", () => {
        row.remove();
      });
      row.appendChild(deleteBtn);
    }

    imageUrlsContainer.appendChild(row);
  }

  addImageUrlBtn?.addEventListener("click", () => {
    addImageInputRow("", false);
  });

  // --- Helper function stubs (if not defined elsewhere) ---
  if (typeof cleanObject !== "function") {
    window.cleanObject = function(obj) {
      // Remove undefined values
      return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
    };
  }
  if (typeof setActiveSection !== "function") {
    window.setActiveSection = function(sectionId) {
      // Hide all, show one
      for (const section of contentSections) {
        section.style.display = section.id === sectionId ? "block" : "none";
      }
    };
  }
  if (typeof openAddProductForm !== "function") {
    window.openAddProductForm = function() {
      addProductPanel?.classList.remove("hidden-action");
    };
  }
  if (typeof closeAddProductForm !== "function") {
    window.closeAddProductForm = function() {
      addProductPanel?.classList.add("hidden-action");
    };
  }
  if (typeof resetCreateFormToAddMode !== "function") {
    window.resetCreateFormToAddMode = function() {
      if (!createProductForm) return;
      createProductForm.reset();
      createProductForm.elements.editingProductId.value = "";
      createProductForm.elements.productId.readOnly = false;
      if (saveProductBtn) saveProductBtn.textContent = "Save Product";
      const formPanelTitle = document.getElementById("formPanelTitle");
      if (formPanelTitle) formPanelTitle.textContent = "Add New Product";
      
      // Reset dynamic image URL list to one empty row
      if (imageUrlsContainer) {
        imageUrlsContainer.innerHTML = "";
        addImageInputRow("", true);
      }

      cancelEditBtn?.classList.add("hidden-action");
    };
  }

function openCreateFormForEdit(product) {
  openAddProductForm();

  const formPanelTitle = document.getElementById("formPanelTitle");
  if (formPanelTitle) formPanelTitle.textContent = "Edit Product";

  createProductForm.elements.editingProductId.value = product.productId || "";
  createProductForm.elements.productId.value = product.productId || "";
  createProductForm.elements.productId.readOnly = true;
  createProductForm.elements.name.value = product.name || "";
  createProductForm.elements.price.value = product.price ?? "";
  createProductForm.elements.labelledPrice.value = product.labelledPrice ?? "";
  createProductForm.elements.stock.value = product.stock ?? "";
  createProductForm.elements.brand.value = product.brand || "";
  createProductForm.elements.model.value = product.model || "";
  createProductForm.elements.category.value = product.category || "";
  createProductForm.elements.description.value = product.description || "";
  createProductForm.elements.altNames.value = Array.isArray(product.altNames) ? product.altNames.join(", ") : "";
  
  // Populate image URL rows dynamically
  if (imageUrlsContainer) {
    imageUrlsContainer.innerHTML = "";
    const arr = (Array.isArray(product.images) && product.images.length > 0) ? product.images : [""];
    arr.forEach((url, idx) => {
      addImageInputRow(url, idx === 0);
    });
  }

  if (saveProductBtn) {
    saveProductBtn.textContent = "Update Product";
  }

  cancelEditBtn?.classList.remove("hidden-action");
}

async function fetchProducts() {
  try {
    setActionStatus("Loading current products...");
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load products");
    }

    const productList = data.products || [];

    productsTableBody.innerHTML = "";
    for (const product of productList) {
      const row = document.createElement("tr");
      // Status badge
      let statusHtml = '';
      if (product.stock <= 5) {
        statusHtml = '<span class="badge badge-amber">Low Stock</span>';
      } else if (product.isAvailable) {
        statusHtml = '<span class="badge badge-green">Active</span>';
      } else {
        statusHtml = '<span class="badge">Inactive</span>';
      }
      // Product image (first image)
      let imageHtml = '';
      if (Array.isArray(product.images) && product.images[0]) {
        imageHtml = `<img src="${product.images[0]}" alt="Product Image" style="max-width:48px;max-height:48px;border-radius:6px;">`;
      }
      // Actions
      const rowActionsHtml = `<div class="row-actions">
        <button type="button" class="mini-btn edit-btn" data-product-id="${product.productId || ''}">Edit</button>
        <button type="button" class="mini-btn del quick-delete-btn" data-product-id="${product.productId || ''}">Delete</button>
      </div>`;
      row.innerHTML = `
        <td>${imageHtml}</td>
        <td style="font-weight:600;">${product.name || ''}</td>
        <td style="color:#64748b;">${product.productId || ''}</td>
        <td>$${product.price?.toFixed(2) ?? ''}</td>
        <td>${product.stock ?? ''}</td>
        <td>${product.brand || ''}</td>
        <td>${product.category || ''}</td>
        <td>${product.description ? product.description.slice(0, 40) + (product.description.length > 40 ? '...' : '') : ''}</td>
        <td>${statusHtml}</td>
        <td>${rowActionsHtml}</td>
      `;
      // Edit/Delete events
      const editBtn = row.querySelector(".edit-btn");
      const quickDeleteBtn = row.querySelector(".quick-delete-btn");
      editBtn?.addEventListener("click", () => {
        setActiveSection("productsSection");
        openCreateFormForEdit(product);
      });
      quickDeleteBtn?.addEventListener("click", async () => {
        if (!product.productId) return;
        const confirmDelete = confirm(`Are you sure you want to delete product "${product.name || product.productId}"?`);
        if (!confirmDelete) return;
        try {
          await sendProductRequest(`${API_BASE_URL}/products/${encodeURIComponent(product.productId)}`, "DELETE");
          alert("Product deleted successfully.");
          setActionStatus(`Product ${product.productId} deleted successfully.`, "success");
          await fetchProducts();
        } catch (error) {
          setActionStatus(error.message, "error");
        }
      });
      productsTableBody.appendChild(row);
    }
    if (productList.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = '<td colspan="10">No products found.</td>';
      productsTableBody.appendChild(emptyRow);
    }

    setActionStatus("Current products loaded.", "success");
  } catch (error) {
    setActionStatus(error.message, "error");
  }
}

async function sendProductRequest(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { message: text || response.statusText };
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }
  return data;
}

if (!payload || !payload.isAdmin) {
  tokenStateEl.textContent = "Invalid";
  localStorage.removeItem("token");
  window.location.href = "login.html";
} else {
  const fullName = `${payload.firstName || ""} ${payload.lastName || ""}`.trim();
  adminNameEl.textContent = fullName ? `Welcome, ${fullName}` : "Welcome, Admin";
  adminEmailEl.textContent = payload.email || "";
  tokenStateEl.textContent = "Valid";

  fetchProducts();
}

  const ordersTableBody = document.getElementById("ordersTableBody");
  const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");
  const customersTableBody = document.getElementById("customersTableBody");
  const refreshCustomersBtn = document.getElementById("refreshCustomersBtn");

  // Order Details Modal elements
  const orderDetailsModal = document.getElementById("orderDetailsModal");
  const closeOrderModalBtn = document.getElementById("closeOrderModalBtn");
  const modalOrderIdEl = document.getElementById("modalOrderId");
  const modalBodyContent = document.getElementById("modalBodyContent");

  closeOrderModalBtn?.addEventListener("click", () => {
    if (orderDetailsModal) orderDetailsModal.style.display = "none";
  });
  
  orderDetailsModal?.addEventListener("click", (e) => {
    if (e.target === orderDetailsModal) {
      orderDetailsModal.style.display = "none";
    }
  });

  function openOrderDetailsModal(order) {
    if (!orderDetailsModal || !modalOrderIdEl || !modalBodyContent) return;

    modalOrderIdEl.textContent = `Order Details: #${order.id}`;

    const productsRows = Array.isArray(order.products)
      ? order.products.map(p => {
          const price = p.price || 0;
          const qty = p.quantity || 1;
          const total = price * qty;
          return `
            <tr>
              <td style="font-weight:600;color:#0f172a;">${p.name}</td>
              <td style="color:#64748b;">${p.productID || 'N/A'}</td>
              <td>Rs. ${price.toLocaleString()}</td>
              <td style="text-align: center;">${qty}</td>
              <td style="font-weight:600;text-align: right;color:#0f172a;">Rs. ${total.toLocaleString()}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="5">No products listed.</td></tr>';

    const subtotal = order.totalPrice || 0; 
    const note = order.note || "";
    let shippingMethod = "Standard";
    let shippingCost = 200;
    if (note.toUpperCase().includes("SHIPPING: EXPRESS")) {
      shippingMethod = "Express";
      shippingCost = 500;
    }
    
    const calculatedSubtotal = Array.isArray(order.products)
      ? order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
      : subtotal - shippingCost;

    const shippingAddress = [
      order.streetnumbert || "",
      order.city || "",
      order.state || "",
      order.zipCode || "",
      order.country || ""
    ].filter(Boolean).join(", ");

    const dateStr = order.date ? new Date(order.date).toLocaleString() : "N/A";
    const status = order.orderStatus || "Pending";
    let badgeClass = "badge";
    if (status === "Pending") badgeClass += " badge-amber";
    else if (status === "Processing") badgeClass += " badge-blue";
    else if (status === "Completed") badgeClass += " badge-green";

    modalBodyContent.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <!-- Status & Date -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:12px; border-radius:10px; border:1.5px solid #e2e8f0;">
          <div>
            <div style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Order Date</div>
            <div style="font-weight:600; color:#334155; margin-top:2px;">${dateStr}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:3px;">Status</div>
            <span class="${badgeClass}">${status}</span>
          </div>
        </div>

        <!-- Customer & Shipping Details -->
        <div>
          <h4>Customer & Delivery Details</h4>
          <div class="modal-details-grid">
            <div class="modal-detail-item">
              <span class="label">Customer Name</span>
              <span class="val">${order.firstName || ""} ${order.lastName || ""}</span>
            </div>
            <div class="modal-detail-item">
              <span class="label">Email Address</span>
              <span class="val">${order.email || "N/A"}</span>
            </div>
            <div class="modal-detail-item" style="grid-column: span 2;">
              <span class="label">Shipping Address</span>
              <span class="val">${shippingAddress || "N/A"}</span>
            </div>
            <div class="modal-detail-item" style="grid-column: span 2;">
              <span class="label">Additional Notes / Info</span>
              <span class="val">${note || "None"}</span>
            </div>
          </div>
        </div>

        <!-- Ordered Products -->
        <div>
          <h4>Ordered Products</h4>
          <div class="table-wrap" style="border:1px solid #e2e8f0; border-radius:10px;">
            <table class="modal-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${productsRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pricing Summary -->
        <div class="modal-price-summary">
          <div class="modal-price-row">
            <span>Items Subtotal</span>
            <strong>Rs. ${calculatedSubtotal.toLocaleString()}</strong>
          </div>
          <div class="modal-price-row">
            <span>Shipping (${shippingMethod})</span>
            <strong>Rs. ${shippingCost.toLocaleString()}</strong>
          </div>
          <div class="modal-price-row total">
            <span>Order Total</span>
            <strong style="color:#e10c42; font-size:1.25rem;">Rs. ${subtotal.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    `;

    orderDetailsModal.style.display = "flex";
  }

  async function fetchOrders() {
    if (!ordersTableBody) return;
    try {
      setActionStatus("Loading customer orders...");
      ordersTableBody.innerHTML = '<tr><td colspan="8">Loading orders...</td></tr>';
      
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders");
      }

      ordersTableBody.innerHTML = "";
      for (const order of data) {
        const row = document.createElement("tr");

        const orderDate = order.date ? new Date(order.date).toLocaleDateString() : "";
        const productsHtml = Array.isArray(order.products) 
          ? order.products.map(p => `${p.name} (x${p.quantity})`).join("<br />")
          : "";

        const status = order.orderStatus || "Pending";
        let badgeClass = "badge";
        if (status === "Pending") badgeClass += " badge-amber";
        else if (status === "Processing") badgeClass += " badge-blue";
        else if (status === "Completed") badgeClass += " badge-green";
        
        let actionBtnHtml = "";
        if (status === "Pending") {
          actionBtnHtml = `<button type="button" class="mini-btn process-btn" data-order-id="${order.id}">Process</button>`;
        } else {
          actionBtnHtml = `<span style="font-size:0.8rem;color:#64748b;">Processed</span>`;
        }

        row.style.cursor = "pointer";
        row.addEventListener("click", () => {
          openOrderDetailsModal(order);
        });

        row.innerHTML = `
          <td style="font-weight:600;">${order.id || ""}</td>
          <td>${order.firstName || ""} ${order.lastName || ""}</td>
          <td style="color:#64748b;">${order.email || ""}</td>
          <td>${productsHtml}</td>
          <td style="font-weight:600;">Rs. ${order.totalPrice?.toLocaleString() ?? "0"}</td>
          <td>${orderDate}</td>
          <td><span class="${badgeClass}">${status}</span></td>
          <td>${actionBtnHtml}</td>
        `;

        const processBtn = row.querySelector(".process-btn");
        processBtn?.addEventListener("click", async (e) => {
          e.stopPropagation(); // Stop event bubbling so modal doesn't open
          const confirmProcess = confirm(`Do you want to start processing order #${order.id}?`);
          if (!confirmProcess) return;
          try {
            setActionStatus(`Processing order #${order.id}...`);
            const processRes = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(order.id)}/process`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            const processData = await processRes.json();
            if (!processRes.ok) {
              throw new Error(processData.message || "Failed to process order");
            }
            alert(`Order #${order.id} is now being processed.`);
            setActionStatus(`Order #${order.id} processed successfully.`, "success");
            await fetchOrders();
          } catch (error) {
            setActionStatus(error.message, "error");
          }
        });

        ordersTableBody.appendChild(row);
      }

      if (data.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="8">No orders found.</td></tr>';
      }
      setActionStatus("Orders loaded.", "success");
    } catch (error) {
      setActionStatus(error.message, "error");
      if (ordersTableBody) {
        ordersTableBody.innerHTML = `<tr><td colspan="8" style="color:#b91c1c;">Error: ${error.message}</td></tr>`;
      }
    }
  }

      async function fetchCustomers() {
        if (!customersTableBody) return;
        if (!token) {
          // No token: redirect to login
          window.location.href = "login.html";
          return;
        }
        try {
          setActionStatus("Loading customers directory...");
          customersTableBody.innerHTML = '<tr><td colspan="7">Loading customers...</td></tr>';
  
          const response = await fetch(`${API_BASE_URL}/api/users`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
  
          if (!response.ok) {
            const contentType = response.headers.get('content-type') || '';
            let errMsg = '';
            if (contentType.includes('application/json')) {
              const errData = await response.json();
              errMsg = errData.message || response.statusText;
            } else {
              errMsg = await response.text();
            }
            throw new Error(errMsg);
          }
  
          const data = await response.json();
  
          customersTableBody.innerHTML = "";
          for (const customer of data) {
            const row = document.createElement("tr");
            const verifiedHtml = customer.isEmailVerified 
              ? '<span class="badge badge-green">Yes</span>' 
              : '<span class="badge">No</span>';
            const blockedHtml = customer.isBlocked 
              ? '<span class="badge badge-amber">Blocked</span>' 
              : '<span class="badge badge-green">Active</span>';
            const roleHtml = customer.isAdmin 
              ? '<span class="badge badge-blue">Admin</span>' 
              : '<span class="badge">User</span>';
            let avatarHtml = '';
            if (customer.image) {
              avatarHtml = `<img src="${customer.image}" alt="Avatar" style="max-width:32px;max-height:32px;border-radius:50%;object-fit:cover;">`;
            } else {
              avatarHtml = `<div style="width:32px;height:32px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#475569;font-size:0.8rem;">${(customer.firstName || 'U')[0].toUpperCase()}</div>`;
            }
            row.innerHTML = `
              <td>${avatarHtml}</td>
              <td style="font-weight:600;">${customer.firstName || ""}</td>
              <td style="font-weight:600;">${customer.lastName || ""}</td>
              <td style="color:#64748b;">${customer.email || ""}</td>
              <td>${verifiedHtml}</td>
              <td>${blockedHtml}</td>
              <td>${roleHtml}</td>
            `;
            customersTableBody.appendChild(row);
          }
          if (data.length === 0) {
            customersTableBody.innerHTML = '<tr><td colspan="7">No customers found.</td></tr>';
          }
          setActionStatus("Customers directory loaded.", "success");
        } catch (error) {
          setActionStatus(error.message, "error");
          if (customersTableBody) {
            customersTableBody.innerHTML = `<tr><td colspan="7" style="color:#b91c1c;">Error: ${error.message}</td></tr>`;
          }
        }
      }

  refreshOrdersBtn?.addEventListener("click", fetchOrders);
  refreshCustomersBtn?.addEventListener("click", fetchCustomers);

  for (const btn of menuButtons) {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      if (!targetId) {
        return;
      }

      // Toggle active class on sidebar buttons
      for (const b of menuButtons) {
        b.classList.remove("active");
      }
      btn.classList.add("active");

      setActiveSection(targetId);

      if (targetId === "productsSection") {
        fetchProducts();
      } else if (targetId === "ordersSection") {
        fetchOrders();
      } else if (targetId === "customersSection") {
        fetchCustomers();
      }
    });
  }



createProductForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(createProductForm);

  const productId = String(formData.get("productId") || "").trim();
  const editingProductId = String(formData.get("editingProductId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const price = Number(formData.get("price"));
  const labelledPrice = Number(formData.get("labelledPrice"));
  const stock = Number(formData.get("stock"));

  if (!productId || !name) {
    setActionStatus("Product ID and Name are required.", "error");
    return;
  }

  if (!Number.isFinite(price) || !Number.isFinite(labelledPrice) || !Number.isFinite(stock)) {
    setActionStatus("Price, Labelled Price and Stock must be valid numbers.", "error");
    return;
  }

  const imageInputs = document.querySelectorAll(".product-image-input");
  const images = Array.from(imageInputs)
    .map(input => input.value.trim())
    .filter(Boolean);

  if (images.length === 0) {
    setActionStatus("At least one product image URL is required.", "error");
    return;
  }
  const body = cleanObject({
    productId,
    name,
    price,
    labelledPrice,
    stock,
    brand: String(formData.get("brand") || "").trim() || undefined,
    model: String(formData.get("model") || "").trim() || undefined,
    category: String(formData.get("category") || "").trim() || undefined,
    description: String(formData.get("description") || "").trim() || undefined,
    altNames: toArray(String(formData.get("altNames") || "")),
    images: images
  });

  try {
    if (saveProductBtn) {
      saveProductBtn.disabled = true;
    }
    setActionStatus("Saving product...", "");

    if (editingProductId) {
      await sendProductRequest(`${API_BASE_URL}/products/${encodeURIComponent(editingProductId)}`, "PUT", body);
      alert("Product updated successfully.");
      setActionStatus("Product updated successfully.", "success");
      closeAddProductForm();
    } else {
      await sendProductRequest(`${API_BASE_URL}/products`, "POST", body);
      alert("Product created successfully.");
      setActionStatus("Product saved successfully and displayed in the table.", "success");
      closeAddProductForm();
    }

    resetCreateFormToAddMode();
    await fetchProducts();
  } catch (error) {
    setActionStatus(error.message, "error");
  } finally {
    if (saveProductBtn) {
      saveProductBtn.disabled = false;
    }
  }
});

refreshBtn?.addEventListener("click", fetchProducts);

openAddProductBtn?.addEventListener("click", openAddProductForm);
closeAddProductBtn?.addEventListener("click", closeAddProductForm);
cancelEditBtn?.addEventListener("click", () => {
  resetCreateFormToAddMode();
  closeAddProductForm();
});
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  closeAddProductForm();
  resetCreateFormToAddMode();

  setActiveSection("productsSection");

  // Mobile Sidebar logic
  const adminHamburgerBtn = document.getElementById("adminHamburgerBtn");
  const adminSidebar = document.getElementById("adminSidebar");
  const closeAdminSidebarBtn = document.getElementById("closeAdminSidebarBtn");

  if (adminHamburgerBtn && adminSidebar) {
    adminHamburgerBtn.addEventListener("click", () => {
      adminSidebar.classList.add("open");
    });
  }
  if (closeAdminSidebarBtn && adminSidebar) {
    closeAdminSidebarBtn.addEventListener("click", () => {
      adminSidebar.classList.remove("open");
    });
  }

  // Close sidebar on mobile when a menu item is clicked
  for (const btn of menuButtons) {
    btn.addEventListener("click", () => {
      if (window.innerWidth <= 860 && adminSidebar) {
        adminSidebar.classList.remove("open");
      }
    });
  }

});
