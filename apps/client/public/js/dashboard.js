// Example user data (could come from API later)
const userData = {
  username: "@hasan",
  bio: "Engineering student who loves coding, coffee, and new ideas 🚀",
  links: [
    { text: "GitHub", url: "https://github.com/" },
    { text: "LinkedIn", url: "https://linkedin.com/" },
    { text: "Portfolio", url: "https://example.com" },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const card = document.getElementById("profile-card");

  // Simulate data loading (replace with fetch() later)
  setTimeout(() => {
    // Fill data
    document.getElementById("username").innerText = userData.username;
    document.getElementById("bio").innerText = userData.bio;

    const linksContainer = document.getElementById("links");
    userData.links.forEach((link) => {
      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.innerText = link.text;
      a.className =
        "block py-2 px-4 rounded-lg border border-neutral-600 text-neutral-200 font-medium shadow hover:bg-neutral-700 hover:border-neutral-500 hover:scale-105 transition transform duration-200";
      linksContainer.appendChild(a);
    });

    // Hide loader & show card
    loader.classList.add("hidden");
    card.classList.remove("hidden");
  }, 500); // fake loading delay
});
