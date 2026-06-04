const form = document.getElementById("loginForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

const API_BASE_URL = "https://techstock-kxtz.onrender.com";
function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

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

const existingToken = localStorage.getItem("token");
if (existingToken) {
  const payload = decodeJwtPayload(existingToken);
  if (payload) {
    if (payload.isAdmin) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "user-dashboard.html";
    }
  }
}

function handleLoginSuccess(token) {
  localStorage.setItem("token", token);
  const payload = decodeJwtPayload(token);
  if (payload?.isAdmin) {
    setStatus("Login successful. Redirecting to admin page...", "success");
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 300);
  } else {
    setStatus("Login successful. Redirecting to user dashboard...", "success");
    setTimeout(() => {
      window.location.href = "user-dashboard.html";
    }, 300);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    setStatus("Please enter both email and password.", "error");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Signing in...");

  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      handleLoginSuccess(data.token);
      return;
    }

    setStatus(data.message || "Login failed.", "error");
  } catch (error) {
    setStatus("Server is waking up, retrying... (may take 30-60 seconds)", "");
    submitBtn.disabled = true;
    await new Promise(r => setTimeout(r, 8000));
    try {
        const retry = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const retryData = await retry.json();
        if (retry.ok && retryData.token) {
            handleLoginSuccess(retryData.token);
            return;
        }
        setStatus(retryData.message || "Login failed.", "error");
    } catch (e) {
        setStatus("Server is still waking up. Please try again in 30 seconds.", "error");
    } finally {
        submitBtn.disabled = false;
    }
}

});

// --- Google Sign-in Implementation ---
window.handleCredentialResponse = async (response) => {
  setStatus("Authenticating Google account...");
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/users/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: response.credential })
    });
    const data = await loginResponse.json();
    if (loginResponse.ok && data.token) {
      handleLoginSuccess(data.token);
    } else {
      setStatus(data.message || "Google login failed.", "error");
    }
  } catch (err) {
    setStatus("Cannot connect to server.", "error");
  }
};

function initGoogleSignIn() {
  if (window.google) {
    google.accounts.id.initialize({
      client_id: "66330843638-bq7pa53vc6taj0kugr1dbjs8i88tr7ef.apps.googleusercontent.com",
      callback: window.handleCredentialResponse
    });
    google.accounts.id.renderButton(
      document.getElementById("googleSignInButton"),
      { theme: "outline", size: "large", width: 370 }
    );
  } else {
    setTimeout(initGoogleSignIn, 100);
  }
}

initGoogleSignIn();
