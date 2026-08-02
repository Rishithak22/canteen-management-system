const API_BASE = "http://localhost:8080";
const LOGIN_URL = `${API_BASE}/admin/login`;

const loginForm = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

// ---------- SHOW / HIDE PASSWORD ----------
function togglePasswordVisibility() {
  const isHidden = password.type === "password";

  password.type = isHidden ? "text" : "password";
  togglePassword.classList.toggle("fa-eye", !isHidden);
  togglePassword.classList.toggle("fa-eye-slash", isHidden);
  togglePassword.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
}

togglePassword.addEventListener("click", togglePasswordVisibility);

// Keyboard support, since togglePassword is a role="button" <i> element rather than a real <button>
togglePassword.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    togglePasswordVisibility();
  }
});

// ---------- LOGIN ----------
loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const admin = {
    username: username.value,
    password: password.value
  };

  try {
    const response = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(admin)
    });

    if (!response.ok) {
      alert("Invalid Username or Password");
      return;
    }

    sessionStorage.setItem("adminLoggedIn", "true");
    window.location.href = "/admin.html";
  } catch (error) {
    console.error(error);
    alert("Unable to connect to server");
  }
});