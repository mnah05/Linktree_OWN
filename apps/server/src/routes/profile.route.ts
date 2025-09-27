import { Router } from "express";
import { getProfile } from "../controller/profile.controller";

const router = Router();

// GET /profiles/:username
router.get("/:username", getProfile);

export default router;
