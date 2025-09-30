import { type Request, type Response } from "express";
import {
  profileDetails,
  saveProfileInfo as saveProfileModel,
} from "../model/profile.model";

/**
 * GET /profiles/:username
 * Fetch profile info by username
 */
export async function getProfile(req: Request, res: Response) {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const userData = await profileDetails(username);

    if (!userData) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.status(200).json(userData);
  } catch (err) {
    console.error("Error in getProfile controller:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /admin/save
 * Save or update profile info for the logged-in user
 * Requires verifyJWT middleware to populate req.user
 */
export async function saveProfileInfo(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { bio, links } = req.body;

    // Optional: validate links format
    if (links && !Array.isArray(links)) {
      return res.status(400).json({ error: "Links must be an array" });
    }

    await saveProfileModel(req.user.username, bio, links);

    return res.status(200).json({ message: "Profile info saved successfully" });
  } catch (err) {
    console.error("Error in saveProfileInfo controller:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
