import { type Request, type Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  userNameExists,
  emailExists,
  createUser,
  getSalt,
} from "../model/auth.model.ts";

const SALT_ROUNDS = 12;

/* ---------- Controllers ---------- */

export async function checkEmailExists(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const exists = await emailExists(email);
    return res.status(200).json({ exists: Boolean(exists) });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function checkUsernameExists(req: Request, res: Response) {
  try {
    const { username } = req.body;
    if (!username)
      return res.status(400).json({ error: "Username is required" });

    const exists = await userNameExists(username);
    return res.status(200).json({ exists: Boolean(exists) });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function registerUser(req: Request, res: Response) {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required: username, name, email, password",
      });
    }

    const [emailAlreadyExists, usernameAlreadyExists] = await Promise.all([
      emailExists(email),
      userNameExists(username),
    ]);

    if (emailAlreadyExists)
      return res.status(409).json({ error: "Email already in use" });
    if (usernameAlreadyExists)
      return res.status(409).json({ error: "Username already in use" });

    const customSalt = crypto.randomBytes(16).toString("hex");
    const saltedPassword = customSalt + password;
    const hashedPassword = await bcryptjs.hash(saltedPassword, SALT_ROUNDS);

    const newUser = await createUser({
      username,
      name,
      email,
      password: hashedPassword,
      salt: customSalt,
    });

    if (!newUser || !newUser[0] || !newUser[0].id) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res
        .status(500)
        .json({ error: "Server configuration error: JWT secret missing" });
    }

    const created = newUser[0];
    const payload = { id: created.id, username: created.username, email };
    const token = jwt.sign(payload, jwtSecret);

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: created.id,
        username: created.username,
        name,
        email,
      },
      token,
    });
  } catch (err: any) {
    if (
      err?.message === "Email already in use" ||
      err?.message === "Username already in use" ||
      err?.message === "Conflict: duplicate field"
    ) {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email or password is missing" });
    }

    const userCredentials = await getSalt({ email });
    if (!userCredentials) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { salt } = userCredentials as { salt?: string };
    const userID =
      (userCredentials as any).userID ?? (userCredentials as any).id;
    const userName =
      (userCredentials as any).userName ?? (userCredentials as any).username;

    const storedHash =
      (userCredentials as any).password ??
      (userCredentials as any).passwordHash ??
      (userCredentials as any).hash ??
      (userCredentials as any).password_hash;

    if (!salt || !storedHash) {
      return res.status(500).json({ error: "Corrupt credentials" });
    }

    const saltedCandidate = salt + password;
    const passwordMatch = await bcryptjs.compare(saltedCandidate, storedHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res
        .status(500)
        .json({ error: "Server configuration error: JWT secret missing" });
    }

    const payload = {
      id: userID,
      username: userName,
      email,
    };
    const token = jwt.sign(payload, jwtSecret);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { userId: userID, username: userName, email },
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}
