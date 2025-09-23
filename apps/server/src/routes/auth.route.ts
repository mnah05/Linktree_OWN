import express from "express";
import {
  checkEmailExists,
  checkUsernameExists,
  registerUser,
} from "../controller/auth.controller.ts";

const router = express.Router();

// Signup routes
router.post("/signup", registerUser);

// Check email availability
router.post("/check-email", checkEmailExists);

// Check username availability
router.post("/check-username", checkUsernameExists);

export default router;
