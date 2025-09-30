document.addEventListener("DOMContentLoaded", () => {
  // Check stored tokens and log for debugging
  console.log(
    "Auth check - token keys in localStorage:",
    Object.keys(localStorage).filter((k) => k.includes("token") || k === "user")
  );

  // Try both token key possibilities
  const tokenValue =
    localStorage.getItem("token") || localStorage.getItem("jwtToken");
  if (tokenValue) {
    console.log(
      "Found token, first 15 chars:",
      tokenValue.substring(0, 15) + "..."
    );
    // Ensure consistent storage regardless of source
    localStorage.setItem("token", tokenValue);
  } else {
    console.warn("No token found in storage");
  }

  // Check if axios is available
  if (typeof axios === "undefined") {
    console.error("Error: axios library not loaded");
    alert(
      "Required libraries not loaded. Please refresh the page or contact support."
    );
    return;
  }

  const form = document.getElementById("profileForm");
  const successMessage = document.getElementById("successMessage");
  const errorMessage = document.getElementById("errorMessage");
  const previewBtn = document.getElementById("previewBtn");
  const usernameEl = document.getElementById("username");

  // Safe URLs
  const AUTH_URL = "http://localhost:5500/auth/";
  const SAVE_URL = "http://localhost:5500/admin/save";
  const PING_URL = "http://localhost:5500/admin/ping";

  let redirecting = false;

  // Extract payload from JWT token
  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to parse JWT:", e);
      return null;
    }
  }

  // Get token from localStorage, check both possible keys
  function getToken() {
    const token =
      localStorage.getItem("token") || localStorage.getItem("jwtToken");
    if (!token) return null;

    // Remove "Bearer " prefix if present
    return token.startsWith("Bearer ") ? token.substring(7) : token;
  }

  // Safely redirect to auth page, preventing loops
  function redirectToAuth() {
    if (redirecting) return;
    redirecting = true;
    console.warn("No valid auth token, redirecting to login...");
    // Clear both possible token keys
    localStorage.removeItem("token");
    localStorage.removeItem("jwtToken");
    window.location.href = AUTH_URL;
  }

  // Display error message
  function showError(msg) {
    if (!errorMessage) return;
    errorMessage.textContent = msg;
    errorMessage.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Display success message
  function showSuccess(msg = "Profile saved successfully!") {
    if (!successMessage) return;
    successMessage.textContent = msg;
    successMessage.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Hide status messages
  function hideMessages() {
    if (successMessage) successMessage.classList.add("hidden");
    if (errorMessage) errorMessage.classList.add("hidden");
  }

  // Pre-fill username from token if available
  function prefillFromToken(token) {
    if (!usernameEl) return;

    try {
      const payload = parseJwt(token);
      if (payload && payload.username) {
        usernameEl.value = payload.username;
        usernameEl.readOnly = true;
        usernameEl.classList.add("opacity-70", "cursor-not-allowed");
        console.log("Username prefilled from token:", payload.username);
      }
    } catch (e) {
      console.error("Error prefilling username from token:", e);
    }
  }

  // Check authentication with server
  async function checkAuth() {
    const token = getToken();
    if (!token) {
      redirectToAuth();
      return false;
    }

    // Try to prefill username from token
    prefillFromToken(token);

    try {
      // Verify token validity with server
      const response = await axios.get(PING_URL, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000, // 5 second timeout
      });

      console.log("Auth verified with server");
      return true;
    } catch (error) {
      console.error("Auth verification failed:", error.message);
      redirectToAuth();
      return false;
    }
  }

  // Initialize the admin page with robust error handling
  async function init() {
    if (!form) {
      console.error("Profile form not found");
      return;
    }

    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) return;

      console.log("Authentication verified, form enabled");

      // Handle form submission
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideMessages();

        try {
          const token = getToken();
          if (!token) {
            redirectToAuth();
            return;
          }

          const bioEl = document.getElementById("bio");
          const bio = bioEl ? bioEl.value.trim() : "";

          // Get username, either from form or token
          let username = usernameEl ? usernameEl.value.trim() : "";
          if (!username) {
            const payload = parseJwt(token);
            username = payload?.username || "";
          }

          if (!username) {
            showError("Username is required");
            return;
          }

          // Collect links
          const links = [];
          for (let i = 1; i <= 3; i++) {
            const textEl = document.getElementById(`link${i}_text`);
            const urlEl = document.getElementById(`link${i}_url`);
            const text = textEl ? textEl.value.trim() : "";
            const url = urlEl ? urlEl.value.trim() : "";

            if (text && url) {
              // Basic URL validation
              try {
                new URL(url.startsWith("http") ? url : `https://${url}`);
                links.push({
                  text,
                  url: url.startsWith("http") ? url : `https://${url}`,
                });
              } catch (e) {
                showError(`Invalid URL in link #${i}`);
                return;
              }
            }
          }

          console.log(
            "Sending data to",
            SAVE_URL,
            "with token length:",
            token.length
          );
          const response = await axios.post(
            SAVE_URL,
            { username, bio, links },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("Save response:", response.status, response.data);
          showSuccess(response.data.message || "Profile saved successfully!");
        } catch (error) {
          console.error("Full save error details:", error);

          if (error.response) {
            if (
              error.response.status === 401 ||
              error.response.status === 403
            ) {
              redirectToAuth();
              return;
            }

            showError(error.response.data?.error || "Failed to save profile");
          } else if (error.request) {
            showError("No response from server. Check your connection.");
          } else {
            showError("Unexpected error. Try again later.");
          }
        }
      });

      // Handle preview button
      if (previewBtn) {
        previewBtn.addEventListener("click", () => {
          const username = usernameEl ? usernameEl.value.trim() : "";

          if (!username) {
            showError("Username is required for preview");
            return;
          }

          window.open(`http://localhost:5500/u/${username}`, "_blank");
        });
      }
    } catch (err) {
      console.error("Critical init failure:", err);
      showError(`Initialization error: ${err.message}`);
    }
  }

  // Start initialization with immediate try/catch
  try {
    init().catch((err) => {
      console.error("Async initialization error:", err);
      showError("Failed to initialize admin page");
    });
  } catch (err) {
    console.error("Fatal initialization error:", err);
  }
});
