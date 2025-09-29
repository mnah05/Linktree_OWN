import { Router } from "express";
import { type Request, type Response } from "express";
import { getProfile } from "../controller/profile.controller";
import path from "path";

const router = Router();

const clientPages = path.resolve(process.cwd(), "apps/client/public/pages");

// Correct order
router.get("/api/:username", getProfile);

router.get("/:username", (req: Request, res: Response) => {
  res.sendFile(path.join(clientPages, "dashboard.html"), (err?: Error) => {
    if (err) {
      console.error("sendFile error:", err);
      res.status(404).send("Not found");
    }
  });
});

export default router;
