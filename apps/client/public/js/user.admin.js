document.addEventListener("DOMContentLoaded", () => {
  const AUTH_URL = "http://localhost:5500/auth/";
  const SAVE_URL = "http://localhost:5500/admin/save";
  const PING_URL = "http://localhost:5500/admin/ping";

  const form = document.getElementById("profileForm");
  const successMessage = document.getElementById("successMessage");
  const errorMessage = document.getElementById("errorMessage");
  const previewBtn = document.getElementById("previewBtn");
  const usernameEl = document.getElementById("username");

  let redirecting = false;

  function parseJwt(token) {
    try {
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(
        decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        ),
      );
    } catch {
      return null;
    }
  }

  function getToken() {
    let token =
      localStorage.getItem("token") || localStorage.getItem("jwtToken");
    return token?.startsWith("Bearer ") ? token.slice(7) : token;
  }

  function redirectToAuth() {
    if (redirecting) return;
    redirecting = true;
    localStorage.removeItem("token");
    localStorage.removeItem("jwtToken");
    window.location.href = AUTH_URL;
  }

  function showMessage(el, msg) {
    if (el) {
      el.textContent = msg;
      el.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function hideMessages() {
    successMessage?.classList.add("hidden");
    errorMessage?.classList.add("hidden");
  }

  function prefillUsername(token) {
    const payload = parseJwt(token);
    if (payload?.username && usernameEl) {
      usernameEl.value = payload.username;
      usernameEl.readOnly = true;
      usernameEl.classList.add("opacity-70", "cursor-not-allowed");
    }
  }

  async function checkAuth() {
    const token = getToken();
    if (!token) return redirectToAuth();
    prefillUsername(token);
    try {
      await axios.get(PING_URL, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      return true;
    } catch {
      redirectToAuth();
      return false;
    }
  }

  async function init() {
    if (!form) return;
    if (!(await checkAuth())) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideMessages();

      const token = getToken();
      if (!token) return redirectToAuth();

      const bio = document.getElementById("bio")?.value.trim() || "";
      let username =
        usernameEl?.value.trim() || parseJwt(token)?.username || "";
      if (!username) return showMessage(errorMessage, "Username is required");

      const links = [];
      for (let i = 1; i <= 3; i++) {
        const text = document.getElementById(`link${i}_text`)?.value.trim();
        let url = document.getElementById(`link${i}_url`)?.value.trim();
        if (text && url) {
          url = url.startsWith("http") ? url : `https://${url}`;
          try {
            new URL(url);
            links.push({ text, url });
          } catch {
            return showMessage(errorMessage, `Invalid URL in link #${i}`);
          }
        }
      }

      try {
        const response = await axios.post(
          SAVE_URL,
          { username, bio, links },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        showMessage(
          successMessage,
          response.data.message || "Profile saved successfully!",
        );
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403)
          return redirectToAuth();
        showMessage(
          errorMessage,
          error.response?.data?.error || "Failed to save profile",
        );
      }
    });

    previewBtn?.addEventListener("click", () => {
      const username = usernameEl?.value.trim();
      if (!username)
        return showMessage(errorMessage, "Username is required for preview");
      window.open(`http://localhost:5500/u/${username}`, "_blank");
    });
  }

  if (typeof axios === "undefined") {
    alert(
      "Required libraries not loaded. Please refresh the page or contact support.",
    );
    return;
  }

  init().catch(() =>
    showMessage(errorMessage, "Failed to initialize admin page"),
  );
});
