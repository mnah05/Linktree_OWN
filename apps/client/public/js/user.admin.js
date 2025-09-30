const form = document.getElementById("profileForm");
const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");
const previewBtn = document.getElementById("previewBtn");

// Load username from JWT token on page load
function loadUserFromToken() {
  const token = sessionStorage.getItem("jwtToken");
  
  if (!token) {
    // Redirect to auth if no token
    window.location.href = "http://localhost:5500/auth/";
    return null;
  }

  try {
    // Decode JWT token (simple base64 decode of payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const username = payload.username;
    
    // Set username in the form
    const usernameField = document.getElementById("username");
    if (usernameField && username) {
      usernameField.value = username;
      usernameField.readOnly = true; // Make it readonly since it comes from JWT
    }
    
    return username;
  } catch (err) {
    console.error("Error decoding token:", err);
    window.location.href = "http://localhost:5500/auth/";
    return null;
  }
}

// Load user on page load
const currentUsername = loadUserFromToken();

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Hide previous messages
  successMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");

  // Get JWT token
  const token = sessionStorage.getItem("jwtToken");
  
  if (!token) {
    errorMessage.textContent = "Please log in to save your profile";
    errorMessage.classList.remove("hidden");
    setTimeout(() => {
      window.location.href = "http://localhost:5500/auth/";
    }, 2000);
    return;
  }

  // Get form data (username comes from JWT, not form)
  const bio = document.getElementById("bio").value.trim();

  // Collect links (only non-empty ones)
  const links = [];
  for (let i = 1; i <= 3; i++) {
    const text = document.getElementById(`link${i}_text`).value.trim();
    const url = document.getElementById(`link${i}_url`).value.trim();

    if (text && url) {
      links.push({ text, url });
    }
  }

  // Prepare data (no username - it's extracted from JWT on backend)
  const profileData = {
    bio,
    links,
  };

  console.log("Submitting profile data:", profileData);

  try {
    // Send to API with Authorization header
    const response = await axios.post(
      "http://localhost:5500/admin/save",
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Response:", response.data);

    // Show success message
    successMessage.classList.remove("hidden");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("Error:", err);
    errorMessage.textContent =
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Failed to save profile. Please try again.";
    errorMessage.classList.remove("hidden");
  }
});

// Preview button
previewBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();

  if (!username) {
    errorMessage.textContent = "Enter a username to preview";
    errorMessage.classList.remove("hidden");
    return;
  }

  // Open preview in new tab
  window.open(`http://localhost:5500/u/${username}`, "_blank");
});
