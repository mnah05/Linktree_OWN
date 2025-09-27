import { type Request, type Response } from "express";
import { profileDetails } from "../model/profile.model";

/**
 * GET /profiles/:username
 * Controller to fetch profile info by username
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
