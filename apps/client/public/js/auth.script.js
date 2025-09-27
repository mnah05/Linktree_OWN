const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// Switch between login and signup
function switchToLogin() {
  loginTab.classList.add("bg-white", "text-gray-900", "shadow-lg");
  loginTab.classList.remove("text-gray-300", "hover:bg-gray-700");
  signupTab.classList.remove("bg-white", "text-gray-900", "shadow-lg");
  signupTab.classList.add("text-gray-300", "hover:bg-gray-700");

  loginForm.classList.remove("form-hidden");
  loginForm.classList.add("form-visible");
  signupForm.classList.remove("form-visible");
  signupForm.classList.add("form-hidden");
}

function switchToSignup() {
  signupTab.classList.add("bg-white", "text-gray-900", "shadow-lg");
  signupTab.classList.remove("text-gray-300", "hover:bg-gray-700");
  loginTab.classList.remove("bg-white", "text-gray-900", "shadow-lg");
  loginTab.classList.add("text-gray-300", "hover:bg-gray-700");

  signupForm.classList.remove("form-hidden");
  signupForm.classList.add("form-visible");
  loginForm.classList.remove("form-visible");
  loginForm.classList.add("form-hidden");
}

loginTab.addEventListener("click", switchToLogin);
signupTab.addEventListener("click", switchToSignup);

// Login form submission
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;

  axios
    .post("http://localhost:5500/auth/login", { email, password: pass })
    .then((res) => {
      console.log("Login successful:", res.data);

      if (res.data.token) localStorage.setItem("jwtToken", res.data.token);
      if (res.data.user)
        localStorage.setItem("user", JSON.stringify(res.data.user));

      // Optional: redirect to dashboard
      // window.location.href = "/dashboard.html";
    })
    .catch((err) => {
      console.error("Login error:", err.response ? err.response.data : err);
    });
});

// Signup form submission
signupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("signupName").value;
  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  axios
    .post("http://localhost:5500/auth/signup", {
      name,
      username,
      email,
      password,
    })
    .then((res) => {
      console.log("Signup successful:", res.data);

      if (res.data.token) localStorage.setItem("jwtToken", res.data.token);
      if (res.data.user)
        localStorage.setItem("user", JSON.stringify(res.data.user));

      // Optional: redirect after signup
      // window.location.href = "/dashboard.html";
    })
    .catch((err) => {
      console.error("Signup error:", err.response ? err.response.data : err);
      // Optional: show user-friendly messages
      // alert(err.response?.data?.error || "Signup failed");
    });
});

// Optional: interactive focus feedback on inputs
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("focus", () =>
    input.parentElement.classList.add("transform", "scale-105")
  );
  input.addEventListener("blur", () =>
    input.parentElement.classList.remove("transform", "scale-105")
  );
});
