import express from "express";
import type { Request, Response } from "express";
import path from "path";

// import your controller functions (adjust relative path if needed)
import {
  checkEmailExists,
  checkUsernameExists,
  registerUser,
  loginUser,
} from "../controller/auth.controller.ts";

const router = express.Router();

// Resolve client pages directory relative to repo root (where you start Bun)
const clientPages = path.resolve(process.cwd(), "apps/client/public/pages");

// Serve static assets from the pages folder
router.use(express.static(clientPages));

// default page route -> serve auth.html
router.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(clientPages, "auth.html"), (err?: Error) => {
    if (err) {
      console.error("sendFile error:", err);
      // fallback: return 404
      res.status(404).send("Not found");
    }
  });
});
// Signup routes
router.post("/signup", registerUser);

// Check email availability
router.post("/check-email", checkEmailExists);

// Check username availability
router.post("/check-username", checkUsernameExists);

// Login Routes
router.post("/login", loginUser);

export default router;
