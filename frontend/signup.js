const form = document.getElementById("signupForm");
const statusEl = document.getElementById("status");
const API_BASE_URL = "http://localhost:5001";

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!firstName || !lastName || !email || !password) {
    setStatus("Please fill in all fields.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password })
    });
    const data = await response.json();
    if (response.ok) {
      setStatus("Registration successful! Logging in...", "success");
      
      try {
        // Automatically authenticate the newly signed-up user
        const loginResponse = await fetch(`${API_BASE_URL}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok && loginData.token) {
          localStorage.setItem("token", loginData.token);
          
          // Decode the token payload
          const payloadPart = loginData.token.split(".")[1];
          const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(atob(base64));
          
          setStatus("Login successful! Redirecting...", "success");
          setTimeout(() => {
            if (payload?.isAdmin) {
              window.location.href = "admin.html";
            } else {
              window.location.href = "user-dashboard.html";
            }
          }, 800);
          return;
        }
      } catch (loginErr) {
        console.error("Auto-login failed:", loginErr);
      }
      
      // Fallback redirection to login page if auto-login fails
      setStatus("Registration successful! Redirecting to login...", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      setStatus(data.message || "Registration failed.", "error");
    }
  } catch (error) {
    setStatus("Network error. Please try again.", "error");
  }
});
