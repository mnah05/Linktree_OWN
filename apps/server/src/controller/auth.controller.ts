import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  userNameExists,
  emailExists,
  createUser,
} from "../model/auth.model.ts";

/**
 * Controller to check if an email already exists
 * @param req - Express request object with email in body
 * @param res - Express response object
 */
export async function checkEmailExists(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const exists = await emailExists(email);
    return res.status(200).json({ exists });
  } catch (err: any) {
    console.error("Error checking email existence:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Controller to check if a username already exists
 * @param req - Express request object with username in body
 * @param res - Express response object
 */
export async function checkUsernameExists(req: Request, res: Response) {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const exists = await userNameExists(username);
    return res.status(200).json({ exists });
  } catch (err: any) {
    console.error("Error checking username existence:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Controller to register a new user with password hashing and JWT generation
 * @param req - Express request object with user data in body
 * @param res - Express response object
 */
export async function registerUser(req: Request, res: Response) {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required: username, name, email, password",
      });
    }

    const emailAlreadyExists = await emailExists(email);
    if (emailAlreadyExists) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Check if username already exists
    const usernameAlreadyExists = await userNameExists(username);
    if (usernameAlreadyExists) {
      return res.status(409).json({ error: "Username already in use" });
    }

    //generating salt and hash password
    const customSalt = crypto.randomBytes(64).toString("hex");
    const saltedPassword = customSalt + password;
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(saltedPassword, saltRounds);

    const newUser = await createUser({
      username,
      name,
      email,
      password: hashedPassword,
      salt: customSalt,
    });

    if (!newUser?.[0]) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const token = jwt.sign(
      {
        userId: newUser[0].id,
        username: newUser[0].username,
        email,
      },
      jwtSecret
    );

    // Check if the user was successfully registered
    if (!newUser || !newUser[0].id) {
      return res.status(500).json({ error: "Failed to register user" });
    }

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        name,
        email,
      },
      token,
    });
  } catch (err: any) {
    console.error("Error creating user:", err);

    // Handle specific database constraint errors
    if (
      err.message === "Email already in use" ||
      err.message === "Username already in use" ||
      err.message === "Conflict: duplicate field"
    ) {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
