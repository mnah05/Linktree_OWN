import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT payload interface
export interface JwtPayload {
  id: string | number;
  username: string;
  email: string;
  iat?: number;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function verifyJWT(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const rawAuth =
    req.headers["authorization"] || req.headers["authorisation"] || "";
  // Normalize (could be "Bearer token", "bearer token", token only, or duplicated)
  let token = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;
  token = typeof token === "string" ? token.trim() : "";

  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7).trim();
  }
  
  if (!token || token === "null" || token === "undefined") {
    res.status(401).json({ error: "No token provided or invalid format" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET is not set");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
    if (!payload.username) {
      res.status(401).json({ error: "Invalid token: missing username" });
      return;
    }
    req.user = payload;
    next();
  } catch (err) {
    console.warn("Token verification failed:", (err as Error).message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
}
