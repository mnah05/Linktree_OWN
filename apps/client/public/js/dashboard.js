// Profile loader script
let loadAttempted = false;

async function loadProfile() {
  // Prevent multiple load attempts
  if (loadAttempted) {
    console.log("Load already attempted, skipping...");
    return;
  }
  loadAttempted = true;

  const path = window.location.pathname.split("/");
  const username = path[2]?.trim();

  console.log("Loading profile for:", username);
  console.log("Full path:", window.location.pathname);

  if (!username) {
    console.error("No username found in URL");
    window.location.href = "/404";
    return;
  }

  const loader = document.getElementById("loader");
  const card = document.getElementById("profile-card");
  const linksContainer = document.getElementById("links");

  if (loader) loader.classList.remove("hidden");
  if (card) card.classList.add("hidden");
  if (linksContainer) linksContainer.innerHTML = "";

  try {
    console.log("Fetching from:", `http://localhost:5500/u/api/${username}`);
    const response = await axios.get(`http://localhost:5500/u/api/${username}`);
    const userData = response.data;
    console.log("Profile data received:", userData);

    // Set username with @
    document.getElementById("username").innerText =
      "" + (userData.username || "unknown");

    // Set bio
    document.getElementById("bio").innerText =
      userData.bio || "No bio available";

    // Create links with staggered animation
    if (userData.links && userData.links.length > 0) {
      userData.links.forEach((link, index) => {
        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.innerText = link.text;
        a.className =
          "link-button block py-3 px-4 rounded-md font-medium text-center slide-up";
        a.style.animationDelay = `${index * 0.05}s`;
        linksContainer.appendChild(a);
      });
    }

    // Hide loader and show card
    if (loader) loader.classList.add("hidden");
    if (card) card.classList.remove("hidden");
  } catch (err) {
    console.error("Error loading profile:", err);
    console.error("Error details:", err.response || err.message);
    // Don't redirect, show error instead
    if (loader) loader.classList.add("hidden");
    document.body.innerHTML = `
            <div class="flex items-center justify-center min-h-screen">
              <div class="text-center text-gray-400">
                <h2 class="text-xl font-semibold mb-2">Profile not found</h2>
                <p class="text-sm">Unable to load profile for "${username}"</p>
              </div>
            </div>
          `;
  }
}

window.addEventListener("DOMContentLoaded", loadProfile);
