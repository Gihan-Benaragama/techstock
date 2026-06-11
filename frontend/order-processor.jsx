// order-processor.jsx – Checkout page component mirroring the requested layout
const { useState, useEffect } = React;

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

const OrderProcessor = () => {
  const [cart, setCart] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Pakistan");

  // Options
  const [shippingMethod, setShippingMethod] = useState("standard"); // standard or express
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, card, wallet
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Promo Code
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  // Load user information and cart on mount
  useEffect(() => {
    // 1. Get token & decode user info to pre-fill
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeJwtPayload(token);
      if (decoded) {
        setFullName(`${decoded.firstName || ""} ${decoded.lastName || ""}`.trim());
        setEmail(decoded.email || "");
      }
    }

    // 2. Load Cart
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  // Price Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingCost = shippingMethod === "express" ? 500 : 200;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal + shippingCost - discountAmount;

  const handleApplyPromo = () => {
    setPromoError("");
    setPromoSuccess("");
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === "SMARTBOX10") {
      setDiscountPercent(10);
      setPromoSuccess("Promo code SMARTBOX10 applied! 10% discount.");
    } else if (code === "FREE200") {
      setDiscountPercent(0); // custom handling could be done, but let's give Rs. 200 off
      setPromoSuccess("Promo code FREE200 applied! Rs. 200 discount.");
    } else {
      setPromoError("Invalid promo code. Try SMARTBOX10");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty! Add products first.");
      return;
    }

    if (!termsAgreed) {
      alert("Please accept the Terms & Conditions and Privacy Policy to proceed.");
      return;
    }

    // Basic Validation
    if (!fullName || !email || !phone || !streetAddress || !city || !stateProvince || !zipCode || !country) {
      alert("Please fill in all the required fields.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    // Split name
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const orderData = {
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty
      })),
      total: total,
      firstName,
      lastName,
      email,
      streetnumbert: streetAddress + (apartment ? `, ${apartment}` : ""),
      city,
      state: stateProvince,
      zipCode,
      country,
      note: `Payment: ${paymentMethod.toUpperCase()} | Shipping: ${shippingMethod.toUpperCase()}`
    };

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

    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to place order.");
      }

      // Success
      setOrderId(data.orderId);
      setIsSuccess(true);
      localStorage.setItem("cart", "[]"); // Clear cart
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred while placing your order.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="checkout-page">
        {/* Header */}
        <header className="checkout-header">
          <div className="header-container">
            <img src="./images/download.png" alt="Logo" className="logo" onClick={() => window.location.href = "user-dashboard.html"} style={{ cursor: "pointer", height: "35px", width: "auto", display: "block", objectFit: "contain" }} />
            <nav className="nav-menu">
              <span onClick={() => window.location.href = "user-dashboard.html"}>Home</span>
              <span>Shop All</span>
              <span>New Arrivals</span>
              <span>Best Sellers</span>
              <span>About</span>
            </nav>
            <div className="secure-badge">
              <svg className="lock-icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M18,8H17V6A5,5,0,0,0,7,6V8H6a2,2,0,0,0,-2,2V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2,-2V10A2,2,0,0,0,18,8ZM9,6a3,3,0,0,1,6,0V8H9ZM18,20H6V10H18Z" />
              </svg>
              <span>Secure Checkout</span>
            </div>
          </div>
        </header>

        {/* Breadcrumb Confirmation */}
        <div className="breadcrumbs">
          <span className="breadcrumb-item">Cart</span>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-item">Checkout</span>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-item active">Order Confirmation</span>
        </div>

        {/* Success Content */}
        <main className="success-container">
          <div className="success-card">
            <div className="success-icon-wrapper">
              <svg className="success-check-icon" viewBox="0 0 24 24" width="48" height="48">
                <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M20,6L9,17L4,12" />
              </svg>
            </div>
            <h1>Thank You for Your Order!</h1>
            <p className="order-number-text">Your order has been placed successfully. Order ID is <strong>{orderId}</strong></p>
            <p className="confirmation-email-text">A confirmation email has been sent to <strong>{email}</strong>.</p>

            <div className="delivery-details-card">
              <h3>Delivery Details</h3>
              <p><strong>Customer Name:</strong> {fullName}</p>
              <p><strong>Shipping Address:</strong> {streetAddress}, {apartment ? apartment + ", " : ""}{city}, {stateProvince}, {zipCode}, {country}</p>
              <p><strong>Shipping Method:</strong> {shippingMethod === "express" ? "Express Shipping (1-2 business days)" : "Standard Shipping (3-5 business days)"}</p>
              <p><strong>Payment Method:</strong> {paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "card" ? "Credit / Debit Card" : "Mobile Wallet"}</p>
              <div className="success-total">
                <span>Total Paid:</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <button className="continue-shopping-btn" onClick={() => window.location.href = "user-dashboard.html"}>
              Continue Shopping
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Header */}
      <header className="checkout-header">
        <div className="header-container">
          <img src="./images/download.png" alt="Logo" className="logo" onClick={() => window.location.href = "user-dashboard.html"} style={{ cursor: "pointer", height: "35px", width: "auto", display: "block", objectFit: "contain" }} />
          <nav className="nav-menu">
            <span onClick={() => window.location.href = "user-dashboard.html"}>Home</span>
            <span>Shop All</span>
            <span>New Arrivals</span>
            <span>Best Sellers</span>
            <span>About</span>
          </nav>
          <div className="secure-badge">
            <svg className="lock-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M18,8H17V6A5,5,0,0,0,7,6V8H6a2,2,0,0,0,-2,2V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2,-2V10A2,2,0,0,0,18,8ZM9,6a3,3,0,0,1,6,0V8H9ZM18,20H6V10H18Z" />
            </svg>
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span className="breadcrumb-item" onClick={() => window.location.href = "user-dashboard.html"} style={{ cursor: "pointer" }}>Cart</span>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-item active">Checkout</span>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-item">Order Confirmation</span>
      </div>

      {/* Main Grid */}
      <div className="checkout-layout">

        {/* Left Column: Form */}
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h2>Checkout</h2>
          <p className="subtitle">Please fill in your details to complete your order.</p>

          {/* Contact Information */}
          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label>Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="form-section">
            <h3>Shipping Address</h3>
            <div className="form-group">
              <label>Street Address <span className="required">*</span></label>
              <input
                type="text"
                placeholder="House number and street name"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Apartment, suite, etc. (optional)</label>
              <input
                type="text"
                placeholder="Apartment, suite, etc."
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>City <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label>State / Province <span className="required">*</span></label>
                <select
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                  required
                >
                  <option value="">Select state / province</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                  <option value="Azad Kashmir">Azad Kashmir</option>
                  <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>
              <div className="form-group flex-1">
                <label>Postal / ZIP Code <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Enter postal / ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Country <span className="required">*</span></label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              >
                <option value="Pakistan">Pakistan</option>
                <option value="India">India</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
              </select>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="form-section">
            <h3>Shipping Method</h3>
            <div className="option-cards">
              <div
                className={`option-card ${shippingMethod === "standard" ? "active" : ""}`}
                onClick={() => setShippingMethod("standard")}
              >
                <div className="option-radio-wrapper">
                  <div className="option-radio">
                    {shippingMethod === "standard" && <div className="option-radio-dot" />}
                  </div>
                </div>
                <div className="option-info">
                  <span className="option-title">Standard Shipping</span>
                  <span className="option-desc">3-5 business days</span>
                </div>
                <span className="option-price">Rs. 200</span>
              </div>

              <div
                className={`option-card ${shippingMethod === "express" ? "active" : ""}`}
                onClick={() => setShippingMethod("express")}
              >
                <div className="option-radio-wrapper">
                  <div className="option-radio">
                    {shippingMethod === "express" && <div className="option-radio-dot" />}
                  </div>
                </div>
                <div className="option-info">
                  <span className="option-title">Express Shipping</span>
                  <span className="option-desc">1-2 business days</span>
                </div>
                <span className="option-price">Rs. 500</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="form-section">
            <h3>Payment Method</h3>
            <div className="option-cards-row">
              {/* Cash on Delivery */}
              <div
                className={`option-card-flex ${paymentMethod === "cod" ? "active" : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                <div className="option-radio">
                  {paymentMethod === "cod" && <div className="option-radio-dot" />}
                </div>
                <svg className="payment-icon cod-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8,-8A8,8,0,0,1,12,20ZM13,7H11v4H7v2h4v4h2V13h4V11H13Z" />
                </svg>
                <div className="payment-info">
                  <span className="payment-title">Cash on Delivery</span>
                  <span className="payment-desc">Pay when you receive your order</span>
                </div>
              </div>

              {/* Credit / Debit Card */}
              <div
                className={`option-card-flex ${paymentMethod === "card" ? "active" : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                <div className="option-radio">
                  {paymentMethod === "card" && <div className="option-radio-dot" />}
                </div>
                <svg className="payment-icon card-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M20,4H4A2,2,0,0,0,2,6V18a2,2,0,0,0,2,2H20a2,2,0,0,0,2,-2V6A2,2,0,0,0,20,4Zm0,14H4V12H20ZM20,8H4V6H20Z" />
                </svg>
                <div className="payment-info">
                  <span className="payment-title">Credit / Debit Card</span>
                  <span className="payment-desc">Visa, Mastercard, etc.</span>
                </div>
              </div>

              {/* Easypaisa / JazzCash */}
              <div
                className={`option-card-flex ${paymentMethod === "wallet" ? "active" : ""}`}
                onClick={() => setPaymentMethod("wallet")}
              >
                <div className="option-radio">
                  {paymentMethod === "wallet" && <div className="option-radio-dot" />}
                </div>
                <div className="wallet-badge-mock">easp</div>
                <div className="payment-info">
                  <span className="payment-title">Easypaisa / JazzCash</span>
                  <span className="payment-desc">Pay securely via mobile wallet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="terms-checkbox-container">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
              />
              <span className="checkbox-text">
                I have read and agree to the <span className="pink-text">Terms & Conditions</span> and <span className="pink-text">Privacy Policy</span>.
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="form-actions">
            <div className="back-link" onClick={() => window.location.href = "user-dashboard.html"}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M20,11H7.83l5.59,-5.59L12,4l-8,8 8,8 1.41,-1.41L7.83,13H20v-2z" />
              </svg>
              <span>Back to Cart</span>
            </div>
            <div className="submit-btn-wrapper">
              <button type="submit" className="place-order-btn" disabled={loading}>
                <svg className="btn-lock-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M18,8H17V6A5,5,0,0,0,7,6V8H6a2,2,0,0,0,-2,2V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2,-2V10A2,2,0,0,0,18,8ZM9,6a3,3,0,0,1,6,0V8H9ZM18,20H6V10H18Z" />
                </svg>
                <span>{loading ? "Placing Order..." : "Place Order"}</span>
              </button>
              <div className="submit-note">You won't be charged yet</div>
            </div>
          </div>
        </form>

        {/* Right Column: Order Summary */}
        <aside className="checkout-summary">
          <h3>Order Summary <span className="item-count-badge">{cart.reduce((s, i) => s + i.qty, 0)} Items</span></h3>

          {/* Scrollable Items list */}
          <div className="summary-items-list">
            {cart.length === 0 ? (
              <p className="empty-cart-msg">Your cart is empty.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="summary-item-row">
                  <div className="summary-item-img-container">
                    <img src={item.image || "images/default.png"} alt={item.name} />
                  </div>
                  <div className="summary-item-details">
                    <span className="summary-item-name">{item.name}</span>
                    <span className="summary-item-price-qty">Rs. {item.price.toLocaleString()} &times; {item.qty}</span>
                  </div>
                  <span className="summary-item-total">Rs. {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>

          {/* Promo Code Input */}
          <div className="promo-code-container">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button type="button" className="apply-promo-btn" onClick={handleApplyPromo}>Apply</button>
          </div>
          {promoError && <p className="promo-message error">{promoError}</p>}
          {promoSuccess && <p className="promo-message success">{promoSuccess}</p>}

          {/* Cost breakdown */}
          <div className="cost-breakdown">
            <div className="cost-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="cost-row">
              <span>Shipping</span>
              <span>Rs. {shippingCost.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="cost-row discount">
                <span>Discount ({discountPercent}%)</span>
                <span>- Rs. {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="cost-row total-row">
              <span>Estimated Total</span>
              <span className="total-price">Rs. {total.toLocaleString()}</span>
            </div>
            <div className="tax-shipping-note">Taxes and shipping are calculated at checkout.</div>
          </div>

          {/* Secure checkout note */}
          <div className="secure-checkout-box">
            <svg viewBox="0 0 24 24" width="18" height="18" className="green-lock-icon">
              <path fill="currentColor" d="M18,8H17V6A5,5,0,0,0,7,6V8H6a2,2,0,0,0,-2,2V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2,-2V10A2,2,0,0,0,18,8ZM9,6a3,3,0,0,1,6,0V8H9ZM18,20H6V10H18Z" />
            </svg>
            <div className="secure-text">
              <strong>Secure Checkout</strong>
              <span>Your information is protected with 256-bit SSL encryption.</span>
            </div>
          </div>

          {/* Trust Assurances */}
          <div className="assurances-list">
            <div className="assurance-item">
              <div className="assurance-icon-circle">
                {/* Fast Delivery Truck */}
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M20,8H17V4H3C1.89,4 1,4.89 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8M6,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 6,18.5M17,12V9.5H19.5L21.46,12H17M18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5Z" />
                </svg>
              </div>
              <div className="assurance-details">
                <strong>Fast Delivery</strong>
                <span>Get your products delivered quickly</span>
              </div>
            </div>

            <div className="assurance-item">
              <div className="assurance-icon-circle">
                {/* Easy Returns Arrow */}
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M12,5V1L7,6L12,11V7A6,6 0 0,1 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13H4A8,8 0 0,0 12,21A8,8 0 0,0 20,13A8,8 0 0,0 12,5Z" />
                </svg>
              </div>
              <div className="assurance-details">
                <strong>Easy Returns</strong>
                <span>7-day return policy for your peace of mind</span>
              </div>
            </div>

            <div className="assurance-item">
              <div className="assurance-icon-circle">
                {/* 100% Secure Shield */}
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,11.93V19C8.9,17.9 6.5,14.6 6.06,11H12V11.93Z" />
                </svg>
              </div>
              <div className="assurance-details">
                <strong>100% Secure</strong>
                <span>We ensure secure payment and data protection</span>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};

// Expose globally for the inline Babel script in order-processor.html
window.OrderProcessor = OrderProcessor;
