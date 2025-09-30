const form = document.getElementById("profileForm");
const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");
const previewBtn = document.getElementById("previewBtn");

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Hide previous messages
  successMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");

  // Get form data
  const username = document.getElementById("username").value.trim();
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

  // Validate
  if (!username) {
    errorMessage.textContent = "Username is required";
    errorMessage.classList.remove("hidden");
    return;
  }

  // Prepare data
  const profileData = {
    username,
    bio,
    links,
  };

  console.log("Submitting profile data:", profileData);

  try {
    // Send to API
    const response = await axios.post(
      "http://localhost:5500/admin/save",
      profileData,
    );

    console.log("Response:", response.data);

    // Show success message
    successMessage.classList.remove("hidden");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("Error:", err);
    errorMessage.textContent =
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
