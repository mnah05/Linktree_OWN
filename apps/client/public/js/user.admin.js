const form = document.getElementById("profileForm");
const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");
const previewBtn = document.getElementById("previewBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  successMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");

  const username = document.getElementById("username").value.trim();
  const bio = document.getElementById("bio").value.trim();

  const links = [];
  for (let i = 1; i <= 3; i++) {
    const text = document.getElementById(`link${i}_text`).value.trim();
    const url = document.getElementById(`link${i}_url`).value.trim();
    if (text && url) links.push({ text, url });
  }

  if (!username) {
    errorMessage.textContent = "Username is required";
    errorMessage.classList.remove("hidden");
    return;
  }

  const profileData = { bio, links };

  try {
    // 🔑 Get token from sessionStorage
    const token = sessionStorage.getItem("jwt");
    if (!token) {
      window.location.href = "http://localhost:5500/auth"; // no token → login
      return;
    }

    // 🔎 Step 1: verify token
    const verify = await axios.get("http://localhost:5500/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!verify.data.valid) {
      window.location.href = "http://localhost:5500/auth"; // invalid token
      return;
    }

    // 📝 Step 2: save profile info
    const response = await axios.post(
      "http://localhost:5500/admin/save",
      profileData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Response:", response.data);
    successMessage.classList.remove("hidden");

    // ✅ Redirect to profile page
    window.location.href = `http://localhost:5500/u/${username}`;
  } catch (err) {
    console.error("Error:", err);

    if (err.response?.status === 404) {
      window.location.href = "http://localhost:5500/404"; // not found
    } else if (err.response?.status === 401) {
      window.location.href = "http://localhost:5500/auth"; // unauthorized
    } else {
      errorMessage.textContent =
        err.response?.data?.message ||
        "Failed to save profile. Please try again.";
      errorMessage.classList.remove("hidden");
    }
  }
});

previewBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    errorMessage.textContent = "Enter a username to preview";
    errorMessage.classList.remove("hidden");
    return;
  }
  window.open(`http://localhost:5500/u/${username}`, "_blank");
});
