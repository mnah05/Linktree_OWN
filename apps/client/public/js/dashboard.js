document.getElementById("load-btn").addEventListener("click", async () => {
  const usernameInput = document.getElementById("username-input").value.trim();
  if (!usernameInput) return alert("Please enter a username");

  const loader = document.getElementById("loader");
  const card = document.getElementById("profile-card");
  const linksContainer = document.getElementById("links");

  // Show loader & hide previous card
  loader.classList.remove("hidden");
  card.classList.add("hidden");
  linksContainer.innerHTML = "";

  try {
    const response = await axios.get(
      `http://localhost:5500/username/${usernameInput}`
    );
    const userData = response.data;

    // Fill card
    document.getElementById("username").innerText = userData.username;
    document.getElementById("bio").innerText = userData.bio;
    userData.links.forEach((link) => {
      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.innerText = link.text;
      a.className =
        "block py-2 px-4 rounded-lg border border-neutral-600 text-neutral-200 font-medium shadow hover:bg-neutral-700 hover:border-neutral-500 hover:scale-105 transition transform duration-200";
      linksContainer.appendChild(a);
    });

    loader.classList.add("hidden");
    card.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    loader.classList.add("hidden");
    alert("Profile not found or failed to load.");
  }
});
