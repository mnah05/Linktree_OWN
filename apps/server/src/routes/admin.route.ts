import express, { type Request, type Response } from "express";
import path from "path";
import { saveProfileInfo as saveProfileModel } from "../model/profile.model";
import { userNameExists } from "../model/auth.model";
import { verifyJWT } from "../middleware/jwtVerify.middleware";

const router = express.Router();

// Serve client admin pages
const clientPages = path.resolve(process.cwd(), "apps/client/public/pages");
router.use(express.static(clientPages));

// Redirect to admin edit panel
router.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(clientPages, "user.admin.html"), (err?: Error) => {
    if (err) {
      console.error("sendFile error:", err);
      res.status(404).send("Not found");
    }
  });
});

// Save profile info (protected route)
router.post("/save", verifyJWT, async (req: Request, res: Response) => {
  try {
    const username = req.user?.username; // username from JWT

    if (!username) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user exists directly in DB
    const exists = await userNameExists(username);
    if (!exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const { bio, links } = req.body;

    // Basic validation for links
    if (links && !Array.isArray(links)) {
      return res.status(400).json({ error: "Links must be an array" });
    }

    await saveProfileModel(username, bio, links);

    res.status(200).json({ message: "Profile saved successfully" });
  } catch (error) {
    console.error("Error saving profile info:", error);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

export default router;
